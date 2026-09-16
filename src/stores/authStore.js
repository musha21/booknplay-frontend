import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const persistTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      customer: null,
      owner: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (userData, tokens, extras = {}) => {
        persistTokens(tokens?.accessToken, tokens?.refreshToken);
        set({
          user: userData,
          customer: extras.customer ?? (extras.role === 'CUSTOMER' ? userData : get().customer),
          owner: extras.owner ?? null,
          role: extras.role || userData?.role || null,
          accessToken: tokens?.accessToken || null,
          refreshToken: tokens?.refreshToken || null,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearTokens();
        set({
          user: null,
          customer: null,
          owner: null,
          role: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setTokens: (tokens) => {
        persistTokens(tokens.accessToken, tokens.refreshToken);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || get().refreshToken,
        });
      },

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
          customer: state.customer ? { ...state.customer, ...data } : state.customer,
        })),
    }),
    {
      name: 'booknplay-auth',
      partialize: (state) => ({
        user: state.user,
        customer: state.customer,
        owner: state.owner,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
