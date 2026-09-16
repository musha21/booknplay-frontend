import apiClient from '../lib/axios';

export const listVenues = () => apiClient.get('/owner/venues');
export const getVenue = (venueId) => apiClient.get(`/owner/venues/${venueId}`);
export const createVenue = (data) => apiClient.post('/owner/venues', data);
export const onboardVenue = (data) => apiClient.post('/owner/venues/onboard', data);
export const updateVenue = (venueId, data) => apiClient.put(`/owner/venues/${venueId}`, data);
export const replaceImages = (venueId, imageUrls) =>
  apiClient.put(`/owner/venues/${venueId}/images`, { imageUrls });
export const getOperatingHours = (venueId) =>
  apiClient.get(`/owner/venues/${venueId}/operating-hours`);
export const replaceOperatingHours = (venueId, days) =>
  apiClient.put(`/owner/venues/${venueId}/operating-hours`, { days });
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
  replaceImages,
  getOperatingHours,
  replaceOperatingHours,
  upsertCancellationPolicy,
  listCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  getPricing,
  replacePricing,
};

export default ownerVenuesApi;
