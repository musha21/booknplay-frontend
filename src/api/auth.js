import apiClient from '../lib/axios';

/* ───────────────────────────────────────────────
   Auth endpoints  →  /api/v1/customer/auth/*
─────────────────────────────────────────────── */

export const register = (data) =>
  apiClient.post('/customer/auth/register', data);

export const registerCustomer = register;

export const login = (data) =>
  apiClient.post('/customer/auth/login', data);

export const refresh = (refreshToken) =>
  apiClient.post('/customer/auth/refresh', { refreshToken });

export const logout = (refreshToken) =>
  apiClient.post('/customer/auth/logout', { refreshToken }, { skipAuthRefresh: true });

export const getMe = () =>
  apiClient.get('/customer/auth/me');

export const requestPasswordReset = (email) =>
  apiClient.post('/customer/auth/forgot-password', { email });

export const authApi = {
  login,
  register,
  registerCustomer,
  refresh,
  logout,
  getMe,
  requestPasswordReset,
};

export default authApi;

