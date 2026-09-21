import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { continueAfterAuth } from '../utils/bookingIntent';

const persistCustomer = (res, storeLogin) => {
  const payload = res?.data?.data || res?.data || res;
  const customer = payload.customer || {};
  const name = customer.firstName
    ? `${customer.firstName} ${customer.lastName || ''}`.trim()
    : payload.name || payload.fullName || 'Player';
  storeLogin(
    {
      id: customer.id || payload.id,
      firstName: customer.firstName || payload.firstName || '',
      lastName: customer.lastName || payload.lastName || '',
      name,
      fullName: name,
      email: customer.email || payload.email,
      phone: customer.phone || payload.phone || '',
      role: payload.role || 'CUSTOMER',
    },
    {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    },
    { role: payload.role || 'CUSTOMER', customer }
  );
  return name;
};

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (res) => {
      const name = persistCustomer(res, storeLogin);
      toast.success(`Welcome back, ${name}!`);
      const next = continueAfterAuth(location.state);
      navigate(next.pathname, { state: next.state, replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) => authApi.registerCustomer(data),
    onSuccess: (res) => {
      persistCustomer(res, storeLogin);
      toast.success('Account created. You can finish your booking now.');
      const next = continueAfterAuth(location.state);
      navigate(next.pathname, { state: next.state, replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    },
  });

  const logout = () => {
    storeLogout();
    queryClient.clear();
    toast.info('You have been logged out.');
    navigate('/auth/login');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
};

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storeLogin = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (res) => {
      const name = persistCustomer(res, storeLogin);
      toast.success(`Welcome back, ${name}!`);
      const next = continueAfterAuth(location.state);
      navigate(next.pathname, { state: next.state, replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storeLogin = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data) => authApi.registerCustomer(data),
    onSuccess: (res) => {
      persistCustomer(res, storeLogin);
      toast.success('Account created. You can finish your booking now.');
      const next = continueAfterAuth(location.state);
      navigate(next.pathname, { state: next.state, replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuth();
  return logout;
};

export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};
