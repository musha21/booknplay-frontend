import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const persistTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('booknplay-auth');
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
        try {
          useAuthStore.persist?.clearStorage();
        } catch {
          localStorage.removeItem('booknplay-auth');
        }
      },

      setTokens: (tokens) => {
        const newAccessToken = tokens?.accessToken || get().accessToken;
        const newRefreshToken = tokens?.refreshToken || get().refreshToken;
        persistTokens(newAccessToken, newRefreshToken);
        set({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      },

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
          customer: state.customer ? { ...state.customer, ...data } : state.customer,
        })),

      setOwner: (owner) => set({ owner }),
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
