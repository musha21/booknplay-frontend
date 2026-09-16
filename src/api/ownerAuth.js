import apiClient from '../lib/axios';

export const registerOwner = (data) =>
  apiClient.post('/owner/auth/register', data);

export const loginOwner = (data) =>
  apiClient.post('/owner/auth/login', data);

export const refreshOwner = (refreshToken) =>
  apiClient.post('/owner/auth/refresh', { refreshToken });

export const logoutOwner = (refreshToken) =>
  apiClient.post('/owner/auth/logout', { refreshToken });

export const getOwnerMe = () =>
  apiClient.get('/owner/auth/me');

export const ownerAuthApi = {
  registerOwner,
  loginOwner,
  refreshOwner,
  logoutOwner,
  getOwnerMe,
};

export default ownerAuthApi;
