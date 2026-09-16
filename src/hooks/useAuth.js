import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (res) => {
      const data = res?.data?.data || res?.data || res;
      const customer = data.customer || {};
      storeLogin(
        {
          id: customer.id || data.id,
          firstName: customer.firstName || data.firstName || '',
          lastName: customer.lastName || data.lastName || '',
          name: customer.firstName
            ? `${customer.firstName} ${customer.lastName || ''}`.trim()
            : data.name || data.fullName,
          fullName: customer.firstName
            ? `${customer.firstName} ${customer.lastName || ''}`.trim()
            : data.fullName,
          email: customer.email || data.email,
          phone: customer.phone || data.phone || '',
          role: data.role || 'CUSTOMER',
        },
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        { role: data.role || 'CUSTOMER', customer }
      );
      toast.success(`Welcome back, ${customer.firstName || data.firstName || data.name || 'Player'}!`);
      navigate('/account');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) => authApi.registerCustomer(data),
    onSuccess: (res) => {
      const data = res?.data?.data || res?.data || res;
      const customer = data.customer || {};
      storeLogin(
        {
          id: customer.id || data.id,
          firstName: customer.firstName || data.firstName || '',
          lastName: customer.lastName || data.lastName || '',
          name: customer.firstName
            ? `${customer.firstName} ${customer.lastName || ''}`.trim()
            : data.name || data.fullName,
          fullName: customer.firstName
            ? `${customer.firstName} ${customer.lastName || ''}`.trim()
            : data.fullName,
          email: customer.email || data.email,
          phone: customer.phone || data.phone || '',
          role: data.role || 'CUSTOMER',
        },
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        { role: data.role || 'CUSTOMER', customer }
      );
      toast.success('Registration successful! Welcome to BookNPlay.');
      navigate('/account');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(msg);
    },
  });

  const logout = () => {
    storeLogout();
    queryClient.clear();
    toast.info('You have been logged out.');
    navigate('/login');
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
  const auth = useAuth();
  const navigate = useNavigate();
  const storeLogin = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (res) => {
      const data = res?.data || res;
      const payload = res?.data?.data || res?.data || res;
      storeLogin(
        {
          id: payload.customer?.id || payload.id,
          name: payload.customer
            ? `${payload.customer.firstName || ''} ${payload.customer.lastName || ''}`.trim()
            : payload.name || payload.fullName,
          email: payload.customer?.email || payload.email,
          role: payload.role || 'CUSTOMER',
        },
        {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        },
        { role: payload.role || 'CUSTOMER', customer: payload.customer }
      );
      toast.success(`Welcome back, ${data.name || data.fullName || 'Player'}!`);
      navigate('/account');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const storeLogin = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data) => authApi.registerCustomer(data),
    onSuccess: (res) => {
      const data = res?.data?.data || res?.data || res;
      storeLogin(
        {
          id: data.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName,
          fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          phone: data.phone || data.phoneNumber || '',
          role: data.role || 'CUSTOMER',
        },
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }
      );
      toast.success('Registration successful!');
      navigate('/account');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
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
