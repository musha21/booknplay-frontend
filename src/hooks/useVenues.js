import { useQuery } from '@tanstack/react-query';
import { getVenues, getVenueById, getAllSports, getCourtsByVenue, getAvailability } from '../api/public';

export const useSports = () =>
  useQuery({
    queryKey: ['sports'],
    queryFn: getAllSports,
    staleTime: 1000 * 60 * 10,
  });

export const useVenues = (params) =>
  useQuery({
    queryKey: ['venues', params],
    queryFn: () => getVenues(params),
  });

export const useVenue = (id) =>
  useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id),
    enabled: Boolean(id),
  });

export const useCourts = (venueId) =>
  useQuery({
    queryKey: ['courts', venueId],
    queryFn: () => getCourtsByVenue(venueId),
    enabled: Boolean(venueId),
  });

export const useAvailability = (venueOrCourtId, date, courtId) =>
  useQuery({
    queryKey: ['availability', venueOrCourtId, date, courtId],
    queryFn: () => getAvailability(courtId || venueOrCourtId, date),
    enabled: Boolean(venueOrCourtId) && Boolean(date),
    staleTime: 1000 * 15,
  });

export const useVenueAvailability = (venueId, date, courtId) =>
  useQuery({
    queryKey: ['venueAvailability', venueId, date, courtId],
    queryFn: () => getAvailability(courtId || venueId, date),
    enabled: Boolean(venueId) && Boolean(date),
    staleTime: 1000 * 15,
  });
