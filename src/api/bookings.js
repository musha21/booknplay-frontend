import apiClient from '../lib/axios';

/* ───────────────────────────────────────────────
   Booking endpoints  →  /api/v1/customer/bookings/*
   Requires auth
─────────────────────────────────────────────── */

/**
 * Create a booking
 * POST /customer/bookings
 * @param {import('../constants/apiTypes').BookingCreateRequest} data
 */
export const createBooking = ({ data, idempotencyKey }) =>
  apiClient.post('/customer/bookings', data, {
    headers: { 'Idempotency-Key': idempotencyKey },
  }).then((r) => r.data);

/**
 * Calculate authoritative payment and cancellation terms for a booking request.
 * POST /customer/bookings/quote
 */
export const quoteBooking = (data) =>
  apiClient.post('/customer/bookings/quote', data).then((r) => r.data);

/**
 * Get a booking by ID
 * GET /customer/bookings/:id
 * @param {string} id
 */
export const getBookingById = (id) =>
  apiClient.get(`/customer/bookings/${id}`).then((r) => r.data);

/**
 * Get all my bookings (paginated)
 * GET /customer/bookings
 * @param {{ page?: number, size?: number }} params
 */
export const getMyBookings = (params = {}) =>
  apiClient.get('/customer/bookings', { params }).then((r) => r.data);

/**
 * Get upcoming bookings (paginated)
 * GET /customer/bookings/upcoming
 * @param {{ page?: number, size?: number }} params
 */
export const getUpcomingBookings = (params = {}) =>
  apiClient.get('/customer/bookings/upcoming', { params }).then((r) => r.data);

/**
 * Get booking history (paginated)
 * GET /customer/bookings/history
 * @param {{ page?: number, size?: number }} params
 */
export const getBookingHistory = (params = {}) =>
  apiClient.get('/customer/bookings/history', { params }).then((r) => r.data);

/**
 * Cancel a booking
 * POST /customer/bookings/:id/cancel
 * @param {string} id
 */
export const cancelBooking = (id) =>
  apiClient.post(`/customer/bookings/${id}/cancel`).then((r) => r.data);

/**
 * Preview the server-calculated cancellation fee and refund before confirmation.
 * GET /customer/bookings/:id/cancellation-preview
 */
export const getCancellationPreview = (id) =>
  apiClient.get(`/customer/bookings/${id}/cancellation-preview`).then((r) => r.data);
