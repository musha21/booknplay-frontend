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

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      toast.success('Slot reserved successfully!');
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
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['booking', bookingId]);
      queryClient.invalidateQueries(['bookings']);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking.');
    },
  });
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: ({ bookingId, gateway }) => paymentsApi.initiatePayment(bookingId, gateway),
    onSuccess: (res) => {
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    },
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
