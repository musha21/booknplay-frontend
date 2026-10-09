import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ownerAuthApi from '../api/ownerAuth';
import ownerVenuesApi from '../api/ownerVenues';
import ownerCalendarApi from '../api/ownerCalendar';
import ownerEarningsApi from '../api/ownerEarnings';
import ownerPortalApi from '../api/ownerPortal';
import ownerSubscriptionApi from '../api/ownerSubscription';
import { useAuthStore } from '../stores/authStore';
import { isOwnerSubscriptionsEnabled, resolvePlans } from '../utils/subscription';
import { PAYMENT_GATEWAY } from '../utils/paymentGateway';

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
      toast.success('Business registered — 3 months free trial started');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });
};

export const useOwnerProfile = () => {
  const setOwner = useAuthStore((s) => s.setOwner);
  const role = useAuthStore((s) => s.role);
  return useQuery({
    queryKey: ['owner', 'me'],
    queryFn: async () => {
      const owner = unwrap(await ownerAuthApi.getOwnerMe());
      setOwner(owner);
      return owner;
    },
    enabled: role === 'BUSINESS_OWNER' || role === 'STAFF',
    staleTime: 30_000,
  });
};

export const useOwnerSubscription = (options = {}) => {
  const role = useAuthStore((s) => s.role);
  const setOwner = useAuthStore((s) => s.setOwner);
  const owner = useAuthStore((s) => s.owner);
  const { enabled: enabledOption, ...queryOptions } = options;
  const enabled = enabledOption !== false
    && isOwnerSubscriptionsEnabled()
    && (role === 'BUSINESS_OWNER' || role === 'STAFF');

  return useQuery({
    queryKey: ['owner', 'subscription'],
    queryFn: async () => {
      try {
        const subscription = unwrap(await ownerSubscriptionApi.getSubscription());
        if (owner && subscription) {
          setOwner({ ...owner, subscription });
        }
        return subscription;
      } catch (error) {
        // Backend may not ship this endpoint yet — keep the portal usable.
        if (error.response?.status === 404) return owner?.subscription ?? null;
        throw error;
      }
    },
    staleTime: 30_000,
    retry: false,
    ...queryOptions,
    enabled,
  });
};

export const useSubscriptionPlans = (options = {}) => {
  const role = useAuthStore((s) => s.role);
  const { enabled: enabledOption, ...queryOptions } = options;
  const enabled = enabledOption !== false
    && isOwnerSubscriptionsEnabled()
    && (role === 'BUSINESS_OWNER' || role === 'STAFF');

  return useQuery({
    queryKey: ['owner', 'subscription', 'plans'],
    queryFn: async () => {
      try {
        return resolvePlans(unwrap(await ownerSubscriptionApi.listSubscriptionPlans()));
      } catch (error) {
        if (error.response?.status === 404) return resolvePlans([]);
        throw error;
      }
    },
    staleTime: 60_000,
    retry: false,
    ...queryOptions,
    enabled,
  });
};

export const useSubscriptionCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planCode, billingInterval }) => {
      const data = unwrap(await ownerSubscriptionApi.checkoutSubscription({
        planCode,
        billingInterval,
        gateway: PAYMENT_GATEWAY,
      }));
      return data;
    },
    onSuccess: (data) => {
      const paymentUrl = String(data?.paymentUrl || '').trim();
      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }
      if (data?.paymentId) {
        window.location.assign(`/owner/billing/return?paymentId=${encodeURIComponent(data.paymentId)}`);
        return;
      }
      toast.error('Checkout did not return a payment link');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not start subscription checkout');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'subscription'] });
    },
  });
};

export const useSubscriptionPaymentStatus = (paymentId, options = {}) => {
  const { enabled: enabledOption, ...queryOptions } = options;
  return useQuery({
    queryKey: ['owner', 'subscription', 'payment', paymentId],
    queryFn: async () => unwrap(await ownerSubscriptionApi.getSubscriptionPaymentStatus(paymentId)),
    retry: false,
    ...queryOptions,
    enabled: Boolean(paymentId) && isOwnerSubscriptionsEnabled() && enabledOption !== false,
  });
};

export const useOwnerVenues = (archived = false) =>
  useQuery({
    queryKey: ['owner', 'venues', { archived }],
    queryFn: async () => unwrap(await ownerVenuesApi.listVenues(archived)),
  });

export const useOwnerVenue = (venueId) =>
  useQuery({
    queryKey: ['owner', 'venues', venueId],
    queryFn: async () => unwrap(await ownerVenuesApi.getVenue(venueId)),
    enabled: Boolean(venueId),
  });

export const useArchiveOwnerVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venueId) => ownerVenuesApi.archiveVenue(venueId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'venues'] });
      toast.success('Venue archived');
    },
    onError: (err) => {
      const code = err.response?.data?.code || err.response?.data?.error;
      const message = code === 'VENUE_HAS_FUTURE_BOOKINGS'
        ? 'This venue has future bookings and cannot be archived yet.'
        : err.response?.data?.message || 'Could not archive the venue';
      toast.error(message);
    },
  });
};

export const useRestoreOwnerVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venueId) => ownerVenuesApi.restoreVenue(venueId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'venues'] });
      toast.success('Venue restored');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not restore the venue');
    },
  });
};

export const useSubmitOwnerVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venueId) => ownerVenuesApi.submitVenue(venueId),
    onSuccess: async (_res, venueId) => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'venues'] });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'venues', venueId] });
      toast.success('Venue is live');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not publish the venue');
    },
  });
};

export const useOwnerBookingPolicy = (venueId) =>
  useQuery({
    queryKey: ['owner', 'venues', venueId, 'booking-policy'],
    queryFn: async () => {
      try {
        return unwrap(await ownerVenuesApi.getCancellationPolicy());
      } catch (error) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(venueId),
  });

export const useSaveOwnerBookingPolicy = (venueId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ownerVenuesApi.upsertCancellationPolicy(venueId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'venues', venueId, 'booking-policy'] });
      toast.success('Booking policy published');
    },
    onError: (err) => {
      const message = err.response?.status === 409
        ? 'This policy changed in another session. Reload it before saving again.'
        : err.response?.data?.message || 'Could not save the booking policy';
      toast.error(message);
    },
  });
};

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

export const useOwnerEarnings = (from, to, options = {}) => {
  const { enabled, view, ...queryOptions } = options;
  return useQuery({
    queryKey: ['owner', 'earnings', from, to, view || ''],
    queryFn: async () => unwrap(await ownerEarningsApi.getEarningsSummary({
      from,
      to,
      ...(view ? { view } : {}),
    })),
    enabled: enabled !== false && Boolean(from && to),
    ...queryOptions,
  });
};

export const useOwnerPayouts = () =>
  useQuery({
    queryKey: ['owner', 'payouts'],
    queryFn: async () => unwrap(await ownerEarningsApi.listPayouts()),
  });

export const useOwnerDashboardToday = (options = {}) =>
  useQuery({
    queryKey: ['owner', 'dashboard', 'today'],
    queryFn: async () => unwrap(await ownerPortalApi.getDashboardToday()),
    staleTime: 30_000,
    ...options,
  });

export const useOwnerBookings = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['owner', 'bookings', params],
    queryFn: async () => unwrap(await ownerPortalApi.listBookings(params)),
    ...options,
  });

export const useOwnerBooking = (bookingId, options = {}) =>
  useQuery({
    queryKey: ['owner', 'bookings', bookingId],
    queryFn: async () => unwrap(await ownerPortalApi.getBooking(bookingId)),
    enabled: Boolean(bookingId),
    ...options,
  });

export const useOwnerPayments = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['owner', 'payments', params],
    queryFn: async () => unwrap(await ownerPortalApi.listPayments(params)),
    ...options,
  });

export const useOwnerRefunds = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['owner', 'refunds', params],
    queryFn: async () => unwrap(await ownerPortalApi.listRefunds(params)),
    ...options,
  });

export const useRequestOwnerRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ownerPortalApi.requestRefund(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'refunds'] });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'payments'] });
      toast.success('Refund requested');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not request refund');
    },
  });
};

export const useOwnerCustomers = (q = '', options = {}) =>
  useQuery({
    queryKey: ['owner', 'customers', q],
    queryFn: async () => unwrap(await ownerPortalApi.listCustomers(q ? { q } : {})),
    ...options,
  });

export const useOwnerSports = (options = {}) =>
  useQuery({
    queryKey: ['owner', 'sports'],
    queryFn: async () => unwrap(await ownerPortalApi.listSports()),
    ...options,
  });

export const useOwnerPromotions = (options = {}) =>
  useQuery({
    queryKey: ['owner', 'promotions'],
    queryFn: async () => unwrap(await ownerPortalApi.listPromotions()),
    ...options,
  });

export const useCreateOwnerPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ownerPortalApi.createPromotion(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'promotions'] });
      toast.success('Promotion created');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not create promotion');
    },
  });
};

export const useUpdateOwnerPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promotionId, data }) => ownerPortalApi.updatePromotion(promotionId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'promotions'] });
      toast.success('Promotion updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not update promotion');
    },
  });
};

export const useDeleteOwnerPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promotionId) => ownerPortalApi.deletePromotion(promotionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'promotions'] });
      toast.success('Promotion deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not delete promotion');
    },
  });
};

export const useOwnerSettings = (options = {}) =>
  useQuery({
    queryKey: ['owner', 'settings'],
    queryFn: async () => unwrap(await ownerPortalApi.getSettings()),
    ...options,
  });

export const useUpdateOwnerSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ownerPortalApi.updateSettings(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'settings'] });
      toast.success('Settings saved');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not save settings');
    },
  });
};

export const useOwnerReviews = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['owner', 'reviews', params],
    queryFn: async () => unwrap(await ownerPortalApi.listReviews(params)),
    ...options,
  });

export const useOwnerActivity = (limit = 20, options = {}) =>
  useQuery({
    queryKey: ['owner', 'activity', limit],
    queryFn: async () => unwrap(await ownerPortalApi.listActivity({ limit })),
    ...options,
  });

export const useOwnerCourtPricing = (courtId, options = {}) =>
  useQuery({
    queryKey: ['owner', 'courts', courtId, 'pricing'],
    queryFn: async () => unwrap(await ownerVenuesApi.getPricing(courtId)),
    enabled: Boolean(courtId),
    ...options,
  });

export const useOwnerBlockedSlots = (courtId, options = {}) =>
  useQuery({
    queryKey: ['owner', 'blocked-slots', courtId],
    queryFn: async () => unwrap(await ownerCalendarApi.listBlockedSlots(courtId)),
    enabled: Boolean(courtId),
    ...options,
  });

export const useOwnerMaintenance = (courtId, options = {}) =>
  useQuery({
    queryKey: ['owner', 'maintenance', courtId],
    queryFn: async () => unwrap(await ownerCalendarApi.listMaintenance(courtId)),
    enabled: Boolean(courtId),
    ...options,
  });

export const useInvalidateOwner = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['owner'] });
};
