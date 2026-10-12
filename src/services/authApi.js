import api from './api';

export const authApi = {
  loginUser: async (credentials) => {
    // credentials: { email?: string, mobile?: string, password: string }
    const response = await api.post('/auth/user/login', credentials);
    if (response?.access_token) {
      localStorage.setItem('icu_auth_token', response.access_token);
      localStorage.setItem('icu_user_role', 'user');
      if (response.user?.id) {
        localStorage.setItem('icu_current_user_id', String(response.user.id));
      }
    }
    return response;
  },

  registerUser: async (userData) => {
    // userData: { name, mobile, email, password, designation }
    const response = await api.post('/auth/user/register', userData);
    if (response?.access_token) {
      localStorage.setItem('icu_auth_token', response.access_token);
      localStorage.setItem('icu_user_role', 'user');
      if (response.user?.id) {
        localStorage.setItem('icu_current_user_id', String(response.user.id));
      }
    }
    return response;
  },

  loginHospital: async (credentials) => {
    // credentials: { registration_id?: string, email?: string, password: string }
    const response = await api.post('/auth/hospital/login', credentials);
    if (response?.access_token) {
      localStorage.setItem('icu_auth_token', response.access_token);
      localStorage.setItem('icu_user_role', 'hospital');
      if (response.hospital?.id) {
        localStorage.setItem('icu_current_hospital_id', response.hospital.id);
      }
    }
    return response;
  },

  registerHospital: async (hospitalData) => {
    const response = await api.post('/auth/hospital/register', hospitalData);
    if (response?.access_token) {
      localStorage.setItem('icu_auth_token', response.access_token);
      localStorage.setItem('icu_user_role', 'hospital');
      if (response.hospital?.id) {
        localStorage.setItem('icu_current_hospital_id', response.hospital.id);
      }
    }
    return response;
  },

  getCurrentSession: async () => {
    return api.get('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('icu_auth_token');
    localStorage.removeItem('icu_user_role');
    localStorage.removeItem('icu_current_user_id');
    localStorage.removeItem('icu_current_hospital_id');
  }
};

export default authApi;
