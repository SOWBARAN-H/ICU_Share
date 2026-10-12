import api from './api';

export const hospitalApi = {
  getHospitals: async (params = {}) => {
    return api.get('/hospitals', params);
  },

  getHospitalById: async (hospitalId) => {
    return api.get(`/hospitals/${hospitalId}`);
  },

  getRecommendations: async ({ excludingHospitalId, facility, preferredType } = {}) => {
    return api.get('/hospitals/recommendations', {
      excluding_hospital_id: excludingHospitalId,
      facility,
      preferred_type: preferredType
    });
  },

  getHospitalDashboard: async () => {
    return api.get('/hospital/dashboard');
  },

  getHospitalBookings: async (statusFilter = null, hospitalId = null) => {
    const params = {};
    if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
    const targetHosp = hospitalId || localStorage.getItem('icu_current_hospital_id');
    if (targetHosp) params.hospital_id = targetHosp;
    return api.get('/hospital/bookings', params);
  }
};

export default hospitalApi;
