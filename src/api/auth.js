import apiClient from '../lib/axios';

/* ───────────────────────────────────────────────
   Auth endpoints  →  /api/v1/customer/auth/*
   OTP / password  →  /api/v1/auth/*
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

/** @deprecated Prefer forgotPasswordByPhone — backend no longer implements email forgot for customers. */
export const requestPasswordReset = (email) =>
  apiClient.post('/customer/auth/forgot-password', { email });

export const requestOtp = (data) =>
  apiClient.post('/auth/otp/request', data);

export const verifyOtp = (data) =>
  apiClient.post('/auth/otp/verify', data);

export const registerWithPhone = (data) =>
  apiClient.post('/auth/phone/register', data);

export const forgotPasswordByPhone = (data) =>
  apiClient.post('/auth/password/forgot', data);

export const resetPasswordByPhone = (data) =>
  apiClient.post('/auth/password/reset', data);

export const requestLinkPhoneOtp = (data) =>
  apiClient.post('/user/phone/request-otp', data);

export const verifyLinkPhoneOtp = (data) =>
  apiClient.post('/user/phone/verify', data);

export const authApi = {
  login,
  register,
  registerCustomer,
  refresh,
  logout,
  getMe,
  requestPasswordReset,
  requestOtp,
  verifyOtp,
  registerWithPhone,
  forgotPasswordByPhone,
  resetPasswordByPhone,
  requestLinkPhoneOtp,
  verifyLinkPhoneOtp,
};

export default authApi;
