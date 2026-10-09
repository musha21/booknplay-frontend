import apiClient from '../lib/axios';
import { unwrapApiData } from '../utils/apiData';

const data = (request) => request.then((response) => unwrapApiData(response.data));

export const listOwnerStaff = () => data(apiClient.get('/owner/staff'));
export const inviteOwnerStaff = (payload) => data(apiClient.post('/owner/staff', payload));
export const updateOwnerStaff = (staffId, payload) => data(apiClient.patch(`/owner/staff/${staffId}`, payload));
export const deleteOwnerStaff = (staffId) => data(apiClient.delete(`/owner/staff/${staffId}`));

export const ownerStaffApi = {
  listOwnerStaff,
  inviteOwnerStaff,
  updateOwnerStaff,
  deleteOwnerStaff,
};

export default ownerStaffApi;
