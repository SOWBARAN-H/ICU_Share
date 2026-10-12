import api from './api';

export const bookingApi = {
  createBooking: async (bookingData) => {
    // bookingData maps frontend fields to backend BookingCreate schema
    const payload = {
      hospital_id: bookingData.hospitalId || bookingData.hospital_id,
      patient_name: bookingData.patientName || bookingData.patient_name,
      patient_mobile: bookingData.patientMobile || bookingData.patient_mobile || '+91 98401 23456',
      age: parseInt(bookingData.age, 10) || 50,
      gender: bookingData.gender || 'Female',
      severity: bookingData.acuity || bookingData.severity || 'Critical',
      beds_required: parseInt(bookingData.bedsRequested || bookingData.beds_required, 10) || 1,
      current_location: bookingData.pickupLocation || bookingData.current_location || 'Chennai Central',
      caller_name: bookingData.callerName || bookingData.caller_name || 'Emergency Dispatcher',
      caller_phone: bookingData.callerPhone || bookingData.caller_phone || '+91 98401 23456',
      transit_eta: bookingData.transitEta || bookingData.transit_eta || '10 mins',
      clinical_notes: bookingData.clinicalNotes || bookingData.note || 'Urgent ICU transfer request',
      required_facilities: bookingData.requiredFacilities || ['Ventilator']
    };

    return api.post('/bookings', payload);
  },

  getBooking: async (bookingId) => {
    return api.get(`/bookings/${bookingId}`);
  },

  getAllBookings: async (params = {}) => {
    return api.get('/bookings', params);
  },

  getUserBookings: async () => {
    return api.get('/user/bookings');
  },

  acceptBooking: async (bookingId, bedId = null, hospitalId = null) => {
    return api.post(`/bookings/${bookingId}/accept`, { bed_id: bedId }, { hospitalId });
  },

  rejectBooking: async (bookingId, reason = 'No suitable ICU bed available due to emergency surge.', hospitalId = null) => {
    return api.post(`/bookings/${bookingId}/reject`, { rejection_reason: reason }, { hospitalId });
  },

  cancelBooking: async (bookingId) => {
    return api.delete(`/bookings/${bookingId}`);
  }
};

export default bookingApi;
