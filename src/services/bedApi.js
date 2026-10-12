import api from './api';

export const bedApi = {
  getHospitalBeds: async (hospitalId = null) => {
    const params = hospitalId ? { hospital_id: hospitalId } : {};
    return api.get('/hospital/beds', params);
  },

  updateBedStatus: async (bedId, updateData) => {
    // updateData: { status, patient_name?, expected_release_at?, note? }
    return api.patch(`/hospital/beds/${bedId}`, updateData);
  },

  registerBed: async (bedData) => {
    // bedData: { id, hospital_id, bed_number, ward, bed_type, status, facilities }
    return api.post('/hospital/beds', bedData);
  }
};

export default bedApi;
