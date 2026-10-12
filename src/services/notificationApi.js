import api from './api';

export const notificationApi = {
  getNotifications: async (portal = 'user', hospitalId = null) => {
    const params = { portal };
    if (portal === 'hospital' && hospitalId) {
      params.hospital_id = hospitalId;
    }
    return api.get('/notifications', params);
  },

  markRead: async (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  markAllRead: async (portal = 'user', hospitalId = null) => {
    const params = { portal };
    if (portal === 'hospital' && hospitalId) {
      params.hospital_id = hospitalId;
    }
    return api.post('/notifications/mark-all-read', null, { params });
  },

  clearAll: async (portal = 'user', hospitalId = null) => {
    let query = `?portal=${portal}`;
    if (portal === 'hospital' && hospitalId) {
      query += `&hospital_id=${hospitalId}`;
    }
    return api.delete(`/notifications${query}`);
  }
};

export default notificationApi;
