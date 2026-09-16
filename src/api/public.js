import apiClient from '../lib/axios';

/* ───────────────────────────────────────────────
   Public endpoints  →  /api/v1/public/*
   No auth required
─────────────────────────────────────────────── */

/**
 * Search / list venues
 * GET /public/venues
 * @param {{ city?: string, sportId?: string, name?: string, page?: number, size?: number }} params
 */
export const getVenues = (params = {}) =>
  apiClient.get('/public/venues', { params }).then((r) => r.data);

/**
 * Get a single venue with its courts
 * GET /public/venues/:id
 * @param {string} id
 */
export const getVenueById = (id) =>
  apiClient.get(`/public/venues/${id}`).then((r) => r.data);

/**
 * List all active sports
 * GET /public/sports
 */
export const getAllSports = () =>
  apiClient.get('/public/sports').then((r) => r.data);

/**
 * Get courts for a venue
 * GET /public/venues/:venueId/courts
 * @param {string} venueId
 */
export const getCourtsByVenue = (venueId) =>
  apiClient.get(`/public/venues/${venueId}/courts`).then((r) => r.data);

/**
 * Get slot availability for a court on a date
 * GET /public/availability?courtId=&date=
 * @param {string} courtId
 * @param {string} date  - "YYYY-MM-DD"
 */
export const getAvailability = (courtId, date) =>
  apiClient.get('/public/availability', { params: { courtId, date } }).then((r) => r.data);
