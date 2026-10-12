import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  INITIAL_HOSPITALS, 
  INITIAL_BEDS, 
  INITIAL_BOOKINGS, 
  INITIAL_USER_NOTIFICATIONS, 
  INITIAL_HOSPITAL_NOTIFICATIONS 
} from './mockData';
import { 
  hospitalApi, 
  bedApi, 
  bookingApi, 
  notificationApi, 
  authApi,
  systemApi,
  getWebSocketUrl 
} from '../services';

const ICUContext = createContext(null);
const STORAGE_KEY = 'icu_share_state_v8';

/**
 * Utility to decode and check expiration of a JWT Bearer token
 */
export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null; // Expired token
    }
    return decoded;
  } catch (e) {
    return null;
  }
};

const getAuthFromToken = () => {
  const token = localStorage.getItem('icu_auth_token');
  const decoded = parseJwt(token);
  if (!decoded) {
    localStorage.removeItem('icu_auth_token');
    localStorage.removeItem('icu_user_role');
    localStorage.removeItem('icu_current_user_id');
    localStorage.removeItem('icu_current_hospital_id');
    return { user: null, currentRole: null, currentHospitalId: null };
  }
  const role = decoded.role ? decoded.role.toLowerCase() : null;
  if (role === 'user') {
    return {
      user: {
        id: parseInt(decoded.sub, 10) || 1,
        name: decoded.name || 'User',
        role: 'User / Patient Attendant'
      },
      currentRole: 'user',
      currentHospitalId: null
    };
  } else if (role === 'hospital') {
    return {
      user: null,
      currentRole: 'hospital',
      currentHospitalId: decoded.sub || null
    };
  }
  return { user: null, currentRole: null, currentHospitalId: null };
};

export const ICUProvider = ({ children }) => {
  // Load cached state from localStorage only if authenticated; no unauthenticated demo leak
  const loadInitialState = () => {
    const authState = getAuthFromToken();
    let cached = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        cached = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading localStorage initial state', e);
    }
    return {
      hospitals: cached.hospitals || INITIAL_HOSPITALS,
      beds: cached.beds || INITIAL_BEDS,
      bookings: cached.bookings || INITIAL_BOOKINGS,
      userNotifications: cached.userNotifications || INITIAL_USER_NOTIFICATIONS,
      hospitalNotifications: cached.hospitalNotifications || INITIAL_HOSPITAL_NOTIFICATIONS,
      theme: localStorage.getItem('icu_theme') || 'light',
      user: authState.user,
      currentRole: authState.currentRole,
      currentHospitalId: authState.currentHospitalId,
      loading: false,
      backendOnline: true,
      realtimeConnected: false
    };
  };

  const [state, setState] = useState(loadInitialState);
  const isFetchingRef = useRef(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error writing state to localStorage', e);
    }
  }, [state]);

  // Synchronize across browser tabs via storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed);
        } catch (err) {
          console.error('Failed to parse synchronized storage state', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme || 'light');
    localStorage.setItem('icu_theme', state.theme || 'light');
  }, [state.theme]);

  // Sync hospital context to localStorage
  useEffect(() => {
    if (state.currentHospitalId) {
      localStorage.setItem('icu_current_hospital_id', state.currentHospitalId);
    } else {
      localStorage.removeItem('icu_current_hospital_id');
    }
    if (state.currentRole) {
      localStorage.setItem('icu_user_role', state.currentRole);
    } else {
      localStorage.removeItem('icu_user_role');
    }
  }, [state.currentHospitalId, state.currentRole]);

  // Validate session against authoritative backend on mount
  useEffect(() => {
    const token = localStorage.getItem('icu_auth_token');
    const decoded = parseJwt(token);
    if (!token || !decoded) {
      setState(prev => ({
        ...prev,
        user: null,
        currentRole: null,
        currentHospitalId: null
      }));
      return;
    }

    authApi.getCurrentSession()
      .then(session => {
        if (session?.role === 'USER') {
          setState(prev => ({
            ...prev,
            currentRole: 'user',
            user: {
              id: session.user.id,
              name: session.user.name,
              phone: session.user.mobile,
              email: session.user.email,
              role: 'User / Patient Attendant'
            },
            currentHospitalId: null
          }));
        } else if (session?.role === 'HOSPITAL') {
          setState(prev => ({
            ...prev,
            currentRole: 'hospital',
            user: null,
            currentHospitalId: session.hospital.id
          }));
        } else {
          logout();
        }
      })
      .catch(err => {
        console.warn('Backend rejected active token session:', err);
        logout();
      });
  }, []);

  // Live Backend Data Fetcher - Synchronizes frontend with authoritative SQLite database
  const refreshBackendData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Fetch Hospitals from DB
      const remoteHospitals = await hospitalApi.getHospitals();

      // 2. Fetch Beds for all known hospitals
      const targetHospitalIds = remoteHospitals && remoteHospitals.length > 0 
        ? remoteHospitals.map(h => h.id) 
        : ['hosp-1', 'hosp-2', 'hosp-3', 'hosp-4', 'hosp-5', 'hosp-6'];

      const bedPromises = targetHospitalIds.map(hId => 
        bedApi.getHospitalBeds(hId)
          .then(bList => ({ hId, bList }))
          .catch(() => ({ hId, bList: [] }))
      );
      const bedResults = await Promise.all(bedPromises);
      const updatedBedsMap = {};
      bedResults.forEach(({ hId, bList }) => {
        if (bList && bList.length > 0) {
          updatedBedsMap[hId] = bList;
        }
      });

      // 3. Fetch Bookings from DB (all bookings for global coordination matrix)
      let remoteBookings = [];
      try {
        const currentHosp = state.currentHospitalId || localStorage.getItem('icu_current_hospital_id') || 'hosp-1';
        const [uBookings, hBookings, allBookings] = await Promise.all([
          bookingApi.getUserBookings().catch(() => []),
          hospitalApi.getHospitalBookings(null, currentHosp).catch(() => []),
          bookingApi.getAllBookings().catch(() => [])
        ]);

        const bookingMap = new Map();
        [...(uBookings || []), ...(hBookings || []), ...(allBookings || [])].forEach(b => {
          if (b && b.id) {
            bookingMap.set(b.id, {
              ...b,
              hospitalId: b.hospitalId || b.hospital_id,
              pickupLocation: b.currentLocation || b.pickupLocation || 'Chennai Central'
            });
          }
        });
        remoteBookings = Array.from(bookingMap.values());
        remoteBookings.sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0));
      } catch (bErr) {
        console.warn('Could not fetch bookings from backend', bErr);
      }

      // 4. Fetch User Notifications
      let remoteUserNotifs = [];
      try {
        remoteUserNotifs = await notificationApi.getNotifications('user');
      } catch (nErr) {
        console.warn('Could not fetch user notifications', nErr);
      }

      // 5. Fetch Hospital Notifications
      let remoteHospNotifs = [];
      try {
        remoteHospNotifs = await notificationApi.getNotifications('hospital', state.currentHospitalId || 'hosp-3');
      } catch (nhErr) {
        console.warn('Could not fetch hospital notifications', nhErr);
      }

      setState(prev => ({
        ...prev,
        backendOnline: true,
        hospitals: remoteHospitals && remoteHospitals.length > 0 ? remoteHospitals : prev.hospitals,
        beds: Object.keys(updatedBedsMap).length > 0 ? { ...prev.beds, ...updatedBedsMap } : prev.beds,
        bookings: remoteBookings,
        userNotifications: remoteUserNotifs,
        hospitalNotifications: remoteHospNotifs
      }));
    } catch (err) {
      console.warn('Backend connection notice:', err.message);
      setState(prev => ({ ...prev, backendOnline: false }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [state.currentHospitalId]);

  // Real-Time WebSocket Connection to Backend
  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      try {
        const wsUrl = getWebSocketUrl();
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('[RealTime] WebSocket connected to backend matrix');
          setState(prev => ({ ...prev, realtimeConnected: true, backendOnline: true }));
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(event.data);
            console.log('[RealTime] Event received from database:', payload.event, payload.data);

            if (payload.event === 'CONNECTED') {
              setState(prev => ({ ...prev, realtimeConnected: true, backendOnline: true }));
            } else if (
              payload.event === 'BOOKING_CREATED' ||
              payload.event === 'BOOKING_ACCEPTED' ||
              payload.event === 'BOOKING_REJECTED' ||
              payload.event === 'BOOKING_CANCELLED' ||
              payload.event === 'BED_STATUS_CHANGED' ||
              payload.event === 'BED_ADDED' ||
              payload.event === 'NOTIFICATIONS_UPDATED' ||
              payload.event === 'DATABASE_RESET'
            ) {
              // Immediately re-fetch authoritative database records
              refreshBackendData();
            }
          } catch (e) {
            console.warn('[RealTime] Message error:', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setState(prev => ({ ...prev, realtimeConnected: false }));
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          if (!isMounted) return;
          ws.close();
        };
      } catch (err) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 4000);
      }
    };

    connectWebSocket();

    // Heartbeat ping every 15s to keep WebSocket alive
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [refreshBackendData]);

  // Initial fetch and automatic backup polling interval (every 4 seconds for maximum reliability)
  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 4000);
    return () => clearInterval(interval);
  }, [refreshBackendData]);

  // Actions
  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const setCurrentHospitalId = (id) => {
    localStorage.setItem('icu_current_hospital_id', id);
    setState(prev => ({ ...prev, currentHospitalId: id }));
    setTimeout(refreshBackendData, 50);
  };

  const setCurrentRole = (role) => {
    localStorage.setItem('icu_user_role', role);
    setState(prev => ({ ...prev, currentRole: role }));
  };

  const createBooking = async (bookingData) => {
    try {
      const created = await bookingApi.createBooking(bookingData);
      const normalizedBooking = {
        ...created,
        hospitalId: created.hospitalId || created.hospital_id,
        pickupLocation: created.currentLocation || created.pickupLocation || bookingData.pickupLocation
      };

      setState(prev => ({
        ...prev,
        bookings: [normalizedBooking, ...prev.bookings.filter(b => b.id !== normalizedBooking.id)]
      }));

      // Immediately refresh DB data
      setTimeout(refreshBackendData, 150);
      return created.id;
    } catch (err) {
      console.error('Failed to create booking on backend', err);
      throw err;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await bookingApi.cancelBooking(bookingId);
    } catch (err) {
      console.warn('Could not cancel booking on backend', err);
    }
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.filter(b => b.id !== bookingId)
    }));
    setTimeout(refreshBackendData, 200);
  };

  const acceptBooking = async (bookingId, bedId = null) => {
    const existing = state.bookings.find(b => b.id === bookingId);
    const targetHospId = existing?.hospitalId || state.currentHospitalId || 'hosp-1';

    // Locate actual available beds for this facility
    const hospitalBedList = state.beds[targetHospId] || [];
    const availableBeds = hospitalBedList.filter(b => b.status === 'AVAILABLE');

    let assignedBed = bedId;
    if (!assignedBed || !hospitalBedList.some(b => b.id === assignedBed && b.status === 'AVAILABLE')) {
      assignedBed = availableBeds.length > 0 ? availableBeds[0].id : null;
    }

    // 1. Immediate local optimistic state update (0ms delay) so ticket updates instantly
    setState(prev => {
      const booking = prev.bookings.find(b => b.id === bookingId);
      const hospId = booking?.hospitalId || targetHospId;

      const updatedHospitalBeds = (prev.beds[hospId] || []).map(b => {
        if (assignedBed && b.id === assignedBed) {
          return {
            ...b,
            status: 'RESERVED',
            patientName: booking?.patientName,
            patientLabel: `Admitted Patient (${booking?.patientName || ''})`,
            freeETA: 'Tomorrow, 12:00 PM',
            reserved_for_booking_id: bookingId,
            note: `Reserved for ${booking?.patientName || 'Emergency Patient'} (${bookingId})`
          };
        }
        return b;
      });

      const updatedHospitals = prev.hospitals.map(h => {
        if (h.id === hospId) {
          return {
            ...h,
            availableBeds: Math.max(0, (h.availableBeds ?? 1) - 1),
            reservedBeds: (h.reservedBeds ?? 0) + 1
          };
        }
        return h;
      });

      const updatedBookings = prev.bookings.map(b => b.id === bookingId ? {
        ...b,
        status: 'CONFIRMED',
        assignedBedId: assignedBed,
        assigned_bed_id: assignedBed,
        note: assignedBed ? `Bed ${assignedBed} locked and reserved.` : 'ICU Bed reserved.'
      } : b);

      return {
        ...prev,
        hospitals: updatedHospitals,
        beds: { ...prev.beds, [hospId]: updatedHospitalBeds },
        bookings: updatedBookings
      };
    });

    try {
      const updated = await bookingApi.acceptBooking(bookingId, assignedBed, targetHospId);
      const authoritativeBedId = updated?.assignedBedId || updated?.assigned_bed_id || assignedBed;

      if (updated || authoritativeBedId) {
        setState(prev => {
          const hospId = updated?.hospital_id || targetHospId;
          const updatedBeds = (prev.beds[hospId] || []).map(b => {
            if (b.id === authoritativeBedId) {
              return {
                ...b,
                status: 'RESERVED',
                patientName: updated?.patient_name || existing?.patientName,
                patientLabel: `Admitted Patient (${updated?.patient_name || existing?.patientName || ''})`,
                freeETA: 'Tomorrow, 12:00 PM',
                reserved_for_booking_id: bookingId,
                note: `Reserved for ${updated?.patient_name || existing?.patientName || 'Patient'} (${bookingId})`
              };
            }
            return b;
          });

          const updatedBookings = prev.bookings.map(b => b.id === bookingId ? {
            ...b,
            ...(updated || {}),
            status: 'CONFIRMED',
            assignedBedId: authoritativeBedId,
            assigned_bed_id: authoritativeBedId,
            note: `Bed ${authoritativeBedId} locked and reserved.`
          } : b);

          return {
            ...prev,
            beds: { ...prev.beds, [hospId]: updatedBeds },
            bookings: updatedBookings
          };
        });
      }
      isFetchingRef.current = false;
      setTimeout(refreshBackendData, 150);
      return updated;
    } catch (err) {
      console.error('Failed to accept booking via API', err);
      setTimeout(refreshBackendData, 300);
      throw err;
    }
  };

  const rejectBooking = async (bookingId, rationale) => {
    const existing = state.bookings.find(b => b.id === bookingId);
    const targetHospId = existing?.hospitalId || state.currentHospitalId;
    const reason = rationale || 'No suitable ICU bed available due to emergency surge.';

    // Immediate local optimistic state update
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === bookingId ? {
        ...b,
        status: 'REJECTED',
        rejectionReason: reason,
        note: `Transfer unavailable: ${reason}`
      } : b)
    }));

    try {
      const updated = await bookingApi.rejectBooking(bookingId, reason, targetHospId);
      if (updated) {
        setState(prev => ({
          ...prev,
          bookings: prev.bookings.map(b => b.id === bookingId ? { ...b, ...updated, status: 'REJECTED' } : b)
        }));
      }
      isFetchingRef.current = false;
      setTimeout(refreshBackendData, 150);
      return updated;
    } catch (err) {
      console.error('Failed to reject booking via API', err);
      throw err;
    }
  };

  const addBed = async (hospId, bedData) => {
    const targetHospId = hospId || state.currentHospitalId || 'hosp-1';
    const bedCode = bedData.id || bedData.unitNumber || `ICU-${Date.now().toString().slice(-4)}`;
    const formattedBed = {
      id: bedCode,
      hospital_id: targetHospId,
      bed_number: bedData.bed_number || bedData.unitNumber || bedCode,
      unitNumber: bedData.unitNumber || bedData.bed_number || bedCode,
      ward: bedData.ward || 'General ICU',
      bed_type: bedData.bed_type || bedData.type || 'Trauma ICU',
      type: bedData.type || bedData.bed_type || 'Trauma ICU',
      status: 'AVAILABLE',
      note: bedData.note || 'Available now (Ready for Intake)',
      facilities: Array.isArray(bedData.facilities) ? bedData.facilities.join(', ') : (bedData.facilities || 'Ventilator'),
      facilitiesList: Array.isArray(bedData.facilities) ? bedData.facilities : [(bedData.facilities || 'Ventilator')],
      patientName: null,
      patientLabel: null,
      freeETA: null
    };

    // Immediate local optimistic state update
    setState(prev => {
      const currentList = prev.beds[targetHospId] || [];
      const updatedBeds = [...currentList, formattedBed];

      const avail = updatedBeds.filter(b => b.status === 'AVAILABLE').length;
      const occ = updatedBeds.filter(b => b.status === 'OCCUPIED').length;
      const res = updatedBeds.filter(b => b.status === 'RESERVED').length;
      const maint = updatedBeds.filter(b => b.status === 'MAINTENANCE').length;

      const updatedHospitals = prev.hospitals.map(h => {
        if (h.id === targetHospId) {
          return {
            ...h,
            totalBeds: (h.totalBeds || 0) + 1,
            availableBeds: avail,
            occupiedBeds: occ,
            reservedBeds: res,
            maintenanceBeds: maint
          };
        }
        return h;
      });

      return {
        ...prev,
        beds: { ...prev.beds, [targetHospId]: updatedBeds },
        hospitals: updatedHospitals
      };
    });

    try {
      const created = await bedApi.registerBed({
        id: formattedBed.id,
        hospital_id: targetHospId,
        bed_number: formattedBed.bed_number,
        ward: formattedBed.ward,
        bed_type: formattedBed.bed_type,
        status: formattedBed.status,
        facilities: formattedBed.facilities,
        note: formattedBed.note
      });
      setTimeout(refreshBackendData, 200);
      return created;
    } catch (err) {
      console.error('Failed to register bed on backend', err);
      setTimeout(refreshBackendData, 500);
      throw err;
    }
  };

  const updateBedStatus = async (hospId, bedId, newStatus, details = {}) => {
    try {
      await bedApi.updateBedStatus(bedId, {
        status: newStatus,
        patient_name: details.patientName || details.patient_name,
        expected_release_at: details.freeETA || details.expected_release_at,
        note: details.note
      });
      setTimeout(refreshBackendData, 200);
    } catch (err) {
      console.error('Failed to update bed status on backend', err);
    }

    // Immediate local optimistic update
    setState(prev => {
      const currentBeds = prev.beds[hospId] || [];
      const updatedBeds = currentBeds.map(b => {
        if (b.id === bedId) {
          return {
            ...b,
            status: newStatus,
            patientName: details.patientName || b.patientName,
            patientLabel: details.patientName ? `Admitted Patient (${details.patientName})` : b.patientLabel,
            freeETA: details.freeETA || b.freeETA,
            ...details
          };
        }
        return b;
      });

      const avail = updatedBeds.filter(b => b.status === 'AVAILABLE').length;
      const occ = updatedBeds.filter(b => b.status === 'OCCUPIED').length;
      const res = updatedBeds.filter(b => b.status === 'RESERVED').length;
      const maint = updatedBeds.filter(b => b.status === 'MAINTENANCE').length;

      const updatedHospitals = prev.hospitals.map(h => {
        if (h.id === hospId) {
          return {
            ...h,
            availableBeds: avail,
            occupiedBeds: occ,
            reservedBeds: res,
            maintenanceBeds: maint
          };
        }
        return h;
      });

      return {
        ...prev,
        beds: { ...prev.beds, [hospId]: updatedBeds },
        hospitals: updatedHospitals
      };
    });
  };

  const markAllUserNotificationsRead = async () => {
    try {
      await notificationApi.markAllRead('user');
    } catch (err) {
      console.warn('Failed mark read on backend', err);
    }
    setState(prev => ({
      ...prev,
      userNotifications: prev.userNotifications.map(n => ({ ...n, is_read: true, read: true }))
    }));
  };

  const clearUserNotifications = async () => {
    try {
      await notificationApi.clearAll('user');
    } catch (err) {
      console.warn('Failed clear user notifications on backend', err);
    }
    setState(prev => ({
      ...prev,
      userNotifications: []
    }));
  };

  const markAllHospitalNotificationsRead = async () => {
    try {
      await notificationApi.markAllRead('hospital', state.currentHospitalId);
    } catch (err) {
      console.warn('Failed mark hospital read on backend', err);
    }
    setState(prev => ({
      ...prev,
      hospitalNotifications: prev.hospitalNotifications.map(n => ({ ...n, is_read: true, read: true }))
    }));
  };

  const clearHospitalNotifications = async () => {
    try {
      await notificationApi.clearAll('hospital', state.currentHospitalId);
    } catch (err) {
      console.warn('Failed clear hospital notifs on backend', err);
    }
    setState(prev => ({
      ...prev,
      hospitalNotifications: []
    }));
  };

  // Real Actions - Execute directly against real backend database
  const quickAcceptPendingBooking = async (targetBookingId = null, targetBedId = null) => {
    let pending = null;
    if (targetBookingId) {
      pending = state.bookings.find(b => b.id === targetBookingId);
    } else {
      pending = state.bookings.find(b => b.status === 'PENDING' && (b.hospitalId === state.currentHospitalId || !b.hospitalId))
        || state.bookings.find(b => b.status === 'PENDING');
    }
    if (!pending) return null;

    const hospBeds = state.beds[pending.hospitalId] || [];
    const availBed = hospBeds.find(b => b.status === 'AVAILABLE');
    const bedId = targetBedId || (availBed ? availBed.id : 'ICU-104');
    
    await acceptBooking(pending.id, bedId);
    return pending.id;
  };

  const quickRejectPendingBooking = async (targetBookingId = null, reason = 'No suitable ICU bed available due to emergency surge.') => {
    let pending = null;
    if (targetBookingId) {
      pending = state.bookings.find(b => b.id === targetBookingId);
    } else {
      pending = state.bookings.find(b => b.status === 'PENDING' && (b.hospitalId === state.currentHospitalId || !b.hospitalId))
        || state.bookings.find(b => b.status === 'PENDING');
    }
    if (!pending) return null;

    await rejectBooking(pending.id, reason);
    return pending.id;
  };

  // Aliases for compatibility
  const simulateHospitalAccept = quickAcceptPendingBooking;
  const simulateHospitalReject = quickRejectPendingBooking;

  const resetDatabase = async () => {
    try {
      await systemApi.resetDatabase();
      await refreshBackendData();
      return true;
    } catch (err) {
      console.error('Failed to reset database via backend API', err);
      return false;
    }
  };

  const resetStore = resetDatabase;

  const getAlternativeHospitals = (currentHospId, requiredFacilities = []) => {
    return state.hospitals
      .filter(h => h.id !== currentHospId && h.availableBeds > 0)
      .sort((a, b) => b.availableBeds - a.availableBeds);
  };

  // Auth Functions
  const loginUser = async (credentials) => {
    const res = await authApi.loginUser(credentials);
    if (res?.user) {
      setState(prev => ({
        ...prev,
        currentRole: 'user',
        user: {
          id: res.user.id,
          name: res.user.name,
          phone: res.user.mobile,
          email: res.user.email,
          role: 'User / Patient Attendant'
        }
      }));
    }
    await refreshBackendData();
    return res;
  };

  const registerUser = async (userData) => {
    const res = await authApi.registerUser(userData);
    if (res?.user) {
      setState(prev => ({
        ...prev,
        currentRole: 'user',
        user: {
          id: res.user.id,
          name: res.user.name,
          phone: res.user.mobile,
          email: res.user.email,
          role: 'User / Patient Attendant'
        }
      }));
    }
    await refreshBackendData();
    return res;
  };

  const loginHospital = async (credentials) => {
    const res = await authApi.loginHospital(credentials);
    if (res?.hospital) {
      setState(prev => ({
        ...prev,
        currentRole: 'hospital',
        currentHospitalId: res.hospital.id,
        user: null
      }));
      localStorage.setItem('icu_current_hospital_id', res.hospital.id);
      localStorage.setItem('icu_user_role', 'hospital');
    }
    await refreshBackendData();
    return res;
  };

  const registerHospital = async (hospitalData) => {
    const res = await authApi.registerHospital(hospitalData);
    if (res?.hospital) {
      setState(prev => ({
        ...prev,
        currentRole: 'hospital',
        currentHospitalId: res.hospital.id,
        user: null
      }));
      localStorage.setItem('icu_current_hospital_id', res.hospital.id);
      localStorage.setItem('icu_user_role', 'hospital');
    }
    await refreshBackendData();
    return res;
  };

  const logout = () => {
    authApi.logout();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing cached state', e);
    }
    setState(prev => ({
      ...prev,
      user: null,
      currentRole: null,
      currentHospitalId: null
    }));
  };

  return (
    <ICUContext.Provider value={{
      ...state,
      toggleTheme,
      setCurrentHospitalId,
      setCurrentRole,
      createBooking,
      cancelBooking,
      acceptBooking,
      rejectBooking,
      addBed,
      updateBedStatus,
      markAllUserNotificationsRead,
      clearUserNotifications,
      markAllHospitalNotificationsRead,
      clearHospitalNotifications,
      quickAcceptPendingBooking,
      quickRejectPendingBooking,
      simulateHospitalAccept,
      simulateHospitalReject,
      resetDatabase,
      resetStore,
      getAlternativeHospitals,
      refreshBackendData,
      loginUser,
      registerUser,
      loginHospital,
      registerHospital,
      logout
    }}>
      {children}
    </ICUContext.Provider>
  );
};

export const useICUStore = () => {
  const context = useContext(ICUContext);
  if (!context) {
    throw new Error('useICUStore must be used within an ICUProvider');
  }
  return context;
};
