import apiClient from '../lib/axios';
import { cleanQueryParams, unwrapApiData } from '../utils/apiData';

const get = (url, config) => apiClient.get(url, config).then((r) => unwrapApiData(r.data));

export const getVenues = (params = {}) =>
  get('/public/venues', { params: cleanQueryParams(params) });

export const getVenueById = (id) => get(`/public/venues/${id}`);

export const getAllSports = () => get('/public/sports');

export const getBusinesses = () => get('/public/businesses');
export const getHomepageConfig = () => get('/public/homepage');

export const getCourtsByVenue = (venueId) => get(`/public/venues/${venueId}/courts`);

export const getAvailability = (courtId, date) =>
  get('/public/availability', { params: { courtId, date } });
