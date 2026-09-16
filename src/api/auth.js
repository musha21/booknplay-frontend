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
  apiClient.post('/customer/auth/logout', { refreshToken });

export const getMe = () =>
  apiClient.get('/customer/auth/me');

export const authApi = {
  login,
  register,
  registerCustomer,
  refresh,
  logout,
  getMe,
};

export default authApi;
