import apiClient from '../lib/axios';

export const getCalendar = (venueId, date, courtId) =>
  apiClient.get(`/owner/venues/${venueId}/calendar`, { params: { date, courtId } });

export const createWalkIn = (data) => apiClient.post('/owner/bookings/walk-in', data);

export const updateBookingStatus = (bookingId, status) =>
  apiClient.patch(`/owner/bookings/${bookingId}/status`, { status });

export const listMaintenance = (courtId) =>
  apiClient.get(`/owner/courts/${courtId}/maintenance`);

export const addMaintenance = (courtId, data) =>
  apiClient.post(`/owner/courts/${courtId}/maintenance`, data);

export const deleteMaintenance = (maintenanceId) =>
  apiClient.delete(`/owner/maintenance/${maintenanceId}`);

export const listBlockedSlots = (courtId) =>
  apiClient.get(`/owner/courts/${courtId}/blocked-slots`);

export const addBlockedSlot = (courtId, data) =>
  apiClient.post(`/owner/courts/${courtId}/blocked-slots`, data);

export const deleteBlockedSlot = (blockedSlotId) =>
  apiClient.delete(`/owner/blocked-slots/${blockedSlotId}`);

export const ownerCalendarApi = {
  getCalendar,
  createWalkIn,
  updateBookingStatus,
  listMaintenance,
  addMaintenance,
  deleteMaintenance,
  listBlockedSlots,
  addBlockedSlot,
  deleteBlockedSlot,
};

export default ownerCalendarApi;
