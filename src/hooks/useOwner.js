import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ownerAuthApi from '../api/ownerAuth';
import ownerVenuesApi from '../api/ownerVenues';
import ownerCalendarApi from '../api/ownerCalendar';
import ownerEarningsApi from '../api/ownerEarnings';
import { useAuthStore } from '../stores/authStore';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const persistOwnerSession = (payload, storeLogin) => {
  storeLogin(
    {
      id: payload.owner?.userId,
      email: payload.owner?.email,
      name: payload.owner?.businessName,
      role: payload.role,
    },
    {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    },
    {
      role: payload.role,
      owner: payload.owner,
    }
  );
};

export const useOwnerLogin = () => {
  const navigate = useNavigate();
  const storeLogin = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (credentials) => ownerAuthApi.loginOwner(credentials),
    onSuccess: (res) => {
      persistOwnerSession(unwrap(res), storeLogin);
      toast.success('Welcome to your venue dashboard');
      navigate('/owner');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Invalid owner credentials');
    },
  });
};

export const useOwnerRegister = () => {
  const storeLogin = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (data) => ownerAuthApi.registerOwner(data),
    onSuccess: (res) => {
      persistOwnerSession(unwrap(res), storeLogin);
      toast.success('Business registered');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });
};

export const useOwnerVenues = () =>
  useQuery({
    queryKey: ['owner', 'venues'],
    queryFn: async () => unwrap(await ownerVenuesApi.listVenues()),
  });

export const useOwnerVenue = (venueId) =>
  useQuery({
    queryKey: ['owner', 'venues', venueId],
    queryFn: async () => unwrap(await ownerVenuesApi.getVenue(venueId)),
    enabled: Boolean(venueId),
  });

export const useOwnerCourts = (venueId) =>
  useQuery({
    queryKey: ['owner', 'courts', venueId],
    queryFn: async () => unwrap(await ownerVenuesApi.listCourts(venueId)),
    enabled: Boolean(venueId),
  });

export const useOwnerCalendar = (venueId, date) =>
  useQuery({
    queryKey: ['owner', 'calendar', venueId, date],
    queryFn: async () => unwrap(await ownerCalendarApi.getCalendar(venueId, date)),
    enabled: Boolean(venueId && date),
  });

export const useOwnerEarnings = (from, to) =>
  useQuery({
    queryKey: ['owner', 'earnings', from, to],
    queryFn: async () => unwrap(await ownerEarningsApi.getEarningsSummary({ from, to })),
  });

export const useOwnerPayouts = () =>
  useQuery({
    queryKey: ['owner', 'payouts'],
    queryFn: async () => unwrap(await ownerEarningsApi.listPayouts()),
  });

export const useInvalidateOwner = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['owner'] });
};
