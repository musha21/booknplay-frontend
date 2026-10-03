import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as bookingsApi from '../api/bookings';
import * as paymentsApi from '../api/payments';
import { toast } from 'sonner';

export const useMyBookings = (params) =>
  useQuery({
    queryKey: ['bookings', 'my', params],
    queryFn: () => bookingsApi.getMyBookings(params),
  });

export const useUpcomingBookings = (params) =>
  useQuery({
    queryKey: ['bookings', 'upcoming', params],
    queryFn: () => bookingsApi.getUpcomingBookings(params),
  });

export const useBookingHistory = (params) =>
  useQuery({
    queryKey: ['bookings', 'history', params],
    queryFn: () => bookingsApi.getBookingHistory(params),
  });

export const useBookingDetail = (id) =>
  useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getBookingById(id),
    enabled: Boolean(id),
  });

export const useBookingQuote = (request, options = {}) =>
  useQuery({
    queryKey: ['bookingQuote', request],
    queryFn: () => bookingsApi.quoteBooking(request),
    enabled: Boolean(request),
    retry: false,
    ...options,
  });

export const useCancellationPreview = (bookingId, options = {}) =>
  useQuery({
    queryKey: ['booking', bookingId, 'cancellation-preview'],
    queryFn: () => bookingsApi.getCancellationPreview(bookingId),
    enabled: Boolean(bookingId),
    retry: false,
    ...options,
  });

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      toast.success('Booking created — continue to PayHere sandbox');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to reserve slot. Please try another time.');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.cancelBooking,
    onSuccess: (res, bookingId) => {
      const result = res?.data ?? res;
      const refund = result?.refund;
      toast.success(refund?.status === 'SUCCEEDED'
        ? (refund?.mode === 'PAYHERE'
          ? 'Booking cancelled. Refund sent to your original PayHere payment method.'
          : 'Booking cancelled and refund recorded')
        : 'Booking cancelled successfully. The court slot is free again.');
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookingQuote'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking.');
    },
  });
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: ({ bookingId, gateway }) => paymentsApi.initiatePayment(bookingId, gateway),
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to initiate payment.');
    },
  });
};

export const usePaymentStatus = (bookingId, options = {}) =>
  useQuery({
    queryKey: ['paymentStatus', bookingId],
    queryFn: () => paymentsApi.getPaymentStatus(bookingId),
    enabled: Boolean(bookingId),
    ...options,
  });
