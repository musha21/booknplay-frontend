import apiClient from '../lib/axios';

export const getCalendar = (venueId, date, courtId) =>
  apiClient.get(`/owner/venues/${venueId}/calendar`, { params: { date, courtId } });

export const createWalkIn = (data) => apiClient.post('/owner/bookings/walk-in', data);

export const updateBookingStatus = (bookingId, status) =>
  apiClient.patch(`/owner/bookings/${bookingId}/status`, { status });

export const addMaintenance = (courtId, data) =>
  apiClient.post(`/owner/courts/${courtId}/maintenance`, data);

export const addBlockedSlot = (courtId, data) =>
  apiClient.post(`/owner/courts/${courtId}/blocked-slots`, data);

export const ownerCalendarApi = {
  getCalendar,
  createWalkIn,
  updateBookingStatus,
  addMaintenance,
  addBlockedSlot,
};

export default ownerCalendarApi;
