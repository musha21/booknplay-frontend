import apiClient from '../lib/axios';

export const getDashboardToday = () => apiClient.get('/owner/dashboard/today');

export const listBookings = (params = {}) =>
  apiClient.get('/owner/bookings', { params });

export const getBooking = (bookingId) =>
  apiClient.get(`/owner/bookings/${bookingId}`);

export const listPayments = (params = {}) =>
  apiClient.get('/owner/payments', { params });

export const listRefunds = (params = {}) =>
  apiClient.get('/owner/refunds', { params });

export const requestRefund = (data) =>
  apiClient.post('/owner/refunds', data);

export const listCustomers = (params = {}) =>
  apiClient.get('/owner/customers', { params });

export const listSports = () => apiClient.get('/owner/sports');

export const listPromotions = () => apiClient.get('/owner/promotions');

export const createPromotion = (data) =>
  apiClient.post('/owner/promotions', data);

export const updatePromotion = (promotionId, data) =>
  apiClient.put(`/owner/promotions/${promotionId}`, data);

export const deletePromotion = (promotionId) =>
  apiClient.delete(`/owner/promotions/${promotionId}`);

export const getSettings = () => apiClient.get('/owner/settings');

export const updateSettings = (data) =>
  apiClient.put('/owner/settings', data);

export const listReviews = (params = {}) =>
  apiClient.get('/owner/reviews', { params });

export const listActivity = (params = {}) =>
  apiClient.get('/owner/activity', { params });

export const ownerPortalApi = {
  getDashboardToday,
  listBookings,
  getBooking,
  listPayments,
  listRefunds,
  requestRefund,
  listCustomers,
  listSports,
  listPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getSettings,
  updateSettings,
  listReviews,
  listActivity,
};

export default ownerPortalApi;
