// ICU Share Centralized API Service Layer

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If running on Vite dev server (port 5173), proxy /api
    if (window.location.port === '5173') {
      return '/api';
    }
    // In unified full-stack server (e.g. port 8000), use same origin
    return `${window.location.origin}/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

export const getWebSocketUrl = () => {
  if (typeof window === 'undefined') return 'ws://127.0.0.1:8000/api/ws';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // On Vite dev server port 5173, connect directly to backend 8000
  if (window.location.port === '5173') {
    return `${protocol}//127.0.0.1:8000/api/ws`;
  }
  // On unified server, connect on same host
  return `${protocol}//${window.location.host}/api/ws`;
};

const BASE_URL = getBaseUrl();

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const currentBase = getBaseUrl();
  const url = `${currentBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach JWT token if present in localStorage
  const token = localStorage.getItem('icu_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attach X-Hospital-Id header for institutional hospital portal context when authenticated
  const currentHospitalId = options.hospitalId || localStorage.getItem('icu_current_hospital_id');
  if (currentHospitalId) {
    headers['X-Hospital-Id'] = currentHospitalId;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || response.statusText || 'An API error occurred';
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or connectivity error
    console.error(`API Request Failed: ${options.method || 'GET'} ${url}`, error);
    throw new ApiError(error.message || 'Network request failed. Ensure backend server is running.', 0, null);
  }
}

export const api = {
  get: (endpoint, params = null, options = {}) => {
    let query = '';
    if (params) {
      const filtered = Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '');
      if (filtered.length > 0) {
        query = '?' + new URLSearchParams(filtered).toString();
      }
    }
    return request(`${endpoint}${query}`, { method: 'GET', ...options });
  },

  post: (endpoint, body, options = {}) => {
    return request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    });
  },

  patch: (endpoint, body, options = {}) => {
    return request(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    });
  },

  delete: (endpoint, options = {}) => {
    return request(endpoint, { method: 'DELETE', ...options });
  }
};

export const systemApi = {
  getStatus: () => api.get('/system/status'),
  resetDatabase: () => api.post('/system/reset-db', {})
};

export default api;
