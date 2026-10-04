import apiClient from '../lib/axios';

export const listVenues = (archived = false) =>
  apiClient.get('/owner/venues', { params: { archived } });
export const getVenue = (venueId) => apiClient.get(`/owner/venues/${venueId}`);
export const createVenue = (data) => apiClient.post('/owner/venues', data);
export const onboardVenue = (data) => apiClient.post('/owner/venues/onboard', data);
export const updateVenue = (venueId, data) => apiClient.put(`/owner/venues/${venueId}`, data);
export const submitVenue = (venueId) => apiClient.post(`/owner/venues/${venueId}/submit`);
export const archiveVenue = (venueId) => apiClient.delete(`/owner/venues/${venueId}`);
export const restoreVenue = (venueId) => apiClient.post(`/owner/venues/${venueId}/restore`);
export const replaceImages = (venueId, imageUrls) =>
  apiClient.put(`/owner/venues/${venueId}/images`, { imageUrls });
export const uploadVenueMedia = (venueId, files) => {
  const form = new FormData();
  (Array.isArray(files) ? files : [files]).forEach((file) => {
    if (file) form.append('images', file);
  });
  return apiClient.post(`/owner/venues/${venueId}/media`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const reorderVenueMedia = (venueId, mediaIds) =>
  apiClient.patch(`/owner/venues/${venueId}/media/order`, { mediaIds });
export const deleteVenueMedia = (venueId, mediaId) =>
  apiClient.delete(`/owner/venues/${venueId}/media/${mediaId}`);
export const getOperatingHours = (venueId) =>
  apiClient.get(`/owner/venues/${venueId}/operating-hours`);
export const replaceOperatingHours = (venueId, days) =>
  apiClient.put(`/owner/venues/${venueId}/operating-hours`, { days });
export const getCancellationPolicy = () =>
  apiClient.get('/owner/cancellation-policy');
export const upsertCancellationPolicy = (venueId, data) =>
  apiClient.put(`/owner/venues/${venueId}/cancellation-policy`, data);

export const listCourts = (venueId) => apiClient.get(`/owner/venues/${venueId}/courts`);
export const createCourt = (venueId, data) => apiClient.post(`/owner/venues/${venueId}/courts`, data);
export const updateCourt = (courtId, data) => apiClient.put(`/owner/courts/${courtId}`, data);
export const deleteCourt = (courtId) => apiClient.delete(`/owner/courts/${courtId}`);
export const getPricing = (courtId) => apiClient.get(`/owner/courts/${courtId}/pricing`);
export const replacePricing = (courtId, rules) =>
  apiClient.put(`/owner/courts/${courtId}/pricing`, { rules });

export const ownerVenuesApi = {
  listVenues,
  getVenue,
  createVenue,
  onboardVenue,
  updateVenue,
  submitVenue,
  archiveVenue,
  restoreVenue,
  replaceImages,
  uploadVenueMedia,
  reorderVenueMedia,
  deleteVenueMedia,
  getOperatingHours,
  replaceOperatingHours,
  getCancellationPolicy,
  upsertCancellationPolicy,
  listCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  getPricing,
  replacePricing,
};

export default ownerVenuesApi;
