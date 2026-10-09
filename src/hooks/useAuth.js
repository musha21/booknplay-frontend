import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { revokeAndClearSession } from '../lib/signOut';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { continueAfterAuth } from '../utils/bookingIntent';
import { unwrapAuthPayload } from '../utils/otpAuth';

const persistCustomer = (res, storeLogin) => {
  const payload = unwrapAuthPayload(res);
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

const apiErrorMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login: storeLogin } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (res) => {
      const name = persistCustomer(res, storeLogin);
      toast.success(`Welcome back, ${name}!`);
      const next = continueAfterAuth(location.state);
      navigate(next.pathname, { state: next.state, replace: true });
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Invalid phone/email or password'));
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
      toast.error(apiErrorMessage(err, 'Registration failed. Please check your inputs.'));
    },
  });

  const logout = async () => {
    const path = await revokeAndClearSession(useAuthStore.getState().role || 'CUSTOMER');
    toast.info('You have been logged out.');
    navigate(path);
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
      toast.error(apiErrorMessage(err, 'Invalid phone/email or password'));
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
      toast.error(apiErrorMessage(err, 'Registration failed'));
    },
  });
};

export const useRequestOtp = () =>
  useMutation({
    mutationFn: (data) => authApi.requestOtp(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'Verification code sent');
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Unable to send verification code'));
    },
  });

/** Registration OTP verify — returns verificationToken payload (does not log in). */
export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (data) => authApi.verifyOtp(data),
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Invalid verification code'));
    },
  });

export const useRegisterWithPhone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storeLogin = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data) => authApi.registerWithPhone(data),
    onSuccess: (res) => {
      persistCustomer(res, storeLogin);
      toast.success('Account created. You can finish your booking now.');
      const next = continueAfterAuth(location.state);
      navigate(next.pathname, { state: next.state, replace: true });
    },
    onError: (err) => {
      const code = err?.response?.data?.code;
      if (code === 'EMAIL_EXISTS') {
        toast.error(
          err.response.data.message
            || 'Email already in use. Sign in with email/password, then link this phone from your account.'
        );
        return;
      }
      toast.error(apiErrorMessage(err, 'Registration failed'));
    },
  });
};

export const useForgotPasswordByPhone = () =>
  useMutation({
    mutationFn: (data) => authApi.forgotPasswordByPhone(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'If an account exists, a code was sent');
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Unable to send verification code'));
    },
  });

export const useResetPasswordByPhone = () =>
  useMutation({
    mutationFn: (data) => authApi.resetPasswordByPhone(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'Password updated');
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Could not reset password'));
    },
  });

export const useLinkPhoneRequestOtp = () =>
  useMutation({
    mutationFn: (data) => authApi.requestLinkPhoneOtp(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'Verification code sent');
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Unable to send verification code'));
    },
  });

export const useLinkPhoneVerify = () => {
  const storeLogin = useAuthStore((s) => s.login);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data) => authApi.verifyLinkPhoneOtp(data),
    onSuccess: (res) => {
      const payload = unwrapAuthPayload(res);
      if (payload?.accessToken) {
        persistCustomer(res, storeLogin);
      } else if (payload?.customer?.phone || payload?.phone) {
        updateUser({ phone: payload.customer?.phone || payload.phone });
      }
      toast.success(res?.data?.message || 'Phone number linked successfully');
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, 'Could not link phone number'));
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
