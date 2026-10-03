import { logout as logoutCustomer } from '../api/auth';
import { adminLogout } from '../api/admin';
import { logoutOwner } from '../api/ownerAuth';
import { useAuthStore } from '../stores/authStore';
import queryClient from './queryClient';

const LOGIN_PATH = {
  CUSTOMER: '/auth/login',
  BUSINESS_OWNER: '/owner/login',
  STAFF: '/owner/login',
  SUPER_ADMIN: '/admin/login',
};

export const loginPathForRole = (role) => LOGIN_PATH[role] || '/auth/login';

const revokeRefreshToken = (role, refreshToken) => {
  if (role === 'SUPER_ADMIN') return adminLogout(refreshToken);
  if (role === 'BUSINESS_OWNER' || role === 'STAFF') return logoutOwner(refreshToken);
  return logoutCustomer(refreshToken);
};

/** Revoke the refresh token, then clear both token stores. Local sign-out always runs. */
export async function revokeAndClearSession(role) {
  const state = useAuthStore.getState();
  const refreshToken = state.refreshToken || localStorage.getItem('refreshToken');
  const resolvedRole = role || state.role;

  try {
    if (refreshToken) await revokeRefreshToken(resolvedRole, refreshToken);
  } catch {
    /* A failed revoke must still leave the browser signed out. */
  } finally {
    useAuthStore.getState().logout();
    queryClient.clear();
  }

  return loginPathForRole(resolvedRole);
}
