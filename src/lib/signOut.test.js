import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  logoutCustomer: vi.fn(),
  logoutOwner: vi.fn(),
  adminLogout: vi.fn(),
  clearQueries: vi.fn(),
}));

vi.mock('../api/auth', () => ({ logout: authMocks.logoutCustomer }));
vi.mock('../api/ownerAuth', () => ({ logoutOwner: authMocks.logoutOwner }));
vi.mock('../api/admin', () => ({ adminLogout: authMocks.adminLogout }));
vi.mock('./queryClient', () => ({ default: { clear: authMocks.clearQueries } }));

import { useAuthStore } from '../stores/authStore';
import { revokeAndClearSession } from './signOut';

const seed = (role) => {
  localStorage.setItem('accessToken', 'access');
  localStorage.setItem('refreshToken', 'refresh');
  localStorage.setItem('booknplay-auth', JSON.stringify({ state: { role, refreshToken: 'refresh' } }));
  useAuthStore.setState({
    role,
    accessToken: 'access',
    refreshToken: 'refresh',
    isAuthenticated: true,
    user: { role },
  });
};

describe('revokeAndClearSession', () => {
  beforeEach(() => {
    localStorage.clear();
    authMocks.logoutCustomer.mockReset();
    authMocks.logoutOwner.mockReset();
    authMocks.adminLogout.mockReset();
    authMocks.clearQueries.mockReset();
    useAuthStore.getState().logout();
  });

  it.each([
    ['CUSTOMER', authMocks.logoutCustomer, '/auth/login'],
    ['BUSINESS_OWNER', authMocks.logoutOwner, '/owner/login'],
    ['SUPER_ADMIN', authMocks.adminLogout, '/admin/login'],
  ])('revokes the %s refresh token and clears both stores', async (role, revoke, path) => {
    seed(role);
    revoke.mockResolvedValue({});

    await expect(revokeAndClearSession(role)).resolves.toBe(path);

    expect(revoke).toHaveBeenCalledWith('refresh');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('booknplay-auth')).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(authMocks.clearQueries).toHaveBeenCalled();
  });

  it('still signs the browser out when revoke fails', async () => {
    seed('CUSTOMER');
    authMocks.logoutCustomer.mockRejectedValue(new Error('network'));

    await expect(revokeAndClearSession('CUSTOMER')).resolves.toBe('/auth/login');

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('booknplay-auth')).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('skips the logout request when no refresh token is stored', async () => {
    useAuthStore.setState({ role: 'CUSTOMER', refreshToken: null, isAuthenticated: true });

    await revokeAndClearSession('CUSTOMER');

    expect(authMocks.logoutCustomer).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
