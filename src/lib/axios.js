import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const readAuth = () => {
  // The standalone keys are updated immediately on login/refresh. Prefer them
  // over the persisted Zustand snapshot, which can briefly contain an older
  // customer's token after an account switch or token refresh.
  const storedAccessToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');

  try {
    const raw = localStorage.getItem('booknplay-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const state = parsed?.state || parsed;
      return {
        accessToken: storedAccessToken || state.accessToken,
        refreshToken: storedRefreshToken || state.refreshToken,
        role: state.role,
      };
    }
  } catch {
    /* ignore malformed persist blob */
  }
  return {
    accessToken: storedAccessToken,
    refreshToken: storedRefreshToken,
    role: null,
  };
};

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = readAuth();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, role } = readAuth();
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = role === 'BUSINESS_OWNER' || role === 'STAFF' ? '/owner/login' : '/auth/login';
        return Promise.reject(error);
      }

      const refreshPath = role === 'BUSINESS_OWNER' || role === 'STAFF'
        ? '/owner/auth/refresh'
        : '/customer/auth/refresh';

      try {
        const { data } = await axios.post(`${BASE_URL}${refreshPath}`, { refreshToken });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        try {
          const raw = localStorage.getItem('booknplay-auth');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.state) {
              parsed.state.accessToken = newAccessToken;
              parsed.state.refreshToken = newRefreshToken;
              localStorage.setItem('booknplay-auth', JSON.stringify(parsed));
            }
          }
        } catch {
          /* persist blob optional */
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = role === 'BUSINESS_OWNER' || role === 'STAFF' ? '/owner/login' : '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
