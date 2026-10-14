import apiClient from '../lib/axios';

export const getEarningsSummary = (params = {}) =>
  apiClient.get('/owner/earnings/summary', { params });

export const getDailyEarnings = (params = {}) =>
  apiClient.get('/owner/earnings/daily', { params });

export const listPayouts = () => apiClient.get('/owner/payouts');

export const getPayoutSummary = () => apiClient.get('/owner/payouts/summary');

export const getPayoutDetail = (id) => apiClient.get(`/owner/payouts/${id}`);

export const ownerEarningsApi = {
  getEarningsSummary,
  getDailyEarnings,
  listPayouts,
  getPayoutSummary,
  getPayoutDetail,
};

export default ownerEarningsApi;
