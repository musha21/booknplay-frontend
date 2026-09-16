import apiClient from '../lib/axios';

export const getEarningsSummary = (params = {}) =>
  apiClient.get('/owner/earnings/summary', { params });

export const getDailyEarnings = (params = {}) =>
  apiClient.get('/owner/earnings/daily', { params });

export const listPayouts = () => apiClient.get('/owner/payouts');

export const ownerEarningsApi = {
  getEarningsSummary,
  getDailyEarnings,
  listPayouts,
};

export default ownerEarningsApi;
