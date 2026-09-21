import { useQuery } from '@tanstack/react-query';
import { getVenues, getVenueById, getAllSports, getBusinesses, getHomepageConfig, getCourtsByVenue, getAvailability } from '../api/public';
import { unwrapApiData, unwrapList } from '../utils/apiData';

export const useSports = () =>
  useQuery({
    queryKey: ['sports'],
    queryFn: getAllSports,
    staleTime: 1000 * 60 * 10,
    select: unwrapList,
  });

export const useBusinesses = () =>
  useQuery({
    queryKey: ['public-businesses'],
    queryFn: getBusinesses,
    select: unwrapList,
    staleTime: 1000 * 60 * 5,
  });

export const useHomepageConfig = () =>
  useQuery({ queryKey: ['homepage-config'], queryFn: getHomepageConfig, select: unwrapApiData, staleTime: 1000 * 60 });

export const useVenues = (params) =>
  useQuery({
    queryKey: ['venues', params],
    queryFn: () => getVenues(params),
    select: unwrapList,
    staleTime: 0,
    refetchOnMount: 'always',
  });

export const useVenue = (id) =>
  useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id),
    enabled: Boolean(id),
    select: unwrapApiData,
  });

export const useCourts = (venueId) =>
  useQuery({
    queryKey: ['courts', venueId],
    queryFn: () => getCourtsByVenue(venueId),
    enabled: Boolean(venueId),
    select: unwrapList,
  });

export const useAvailability = (venueOrCourtId, date, courtId) =>
  useQuery({
    queryKey: ['availability', venueOrCourtId, date, courtId],
    queryFn: () => getAvailability(courtId || venueOrCourtId, date),
    enabled: Boolean(venueOrCourtId) && Boolean(date),
    staleTime: 1000 * 15,
    select: (data) => {
      const payload = unwrapApiData(data);
      if (Array.isArray(payload)) return payload;
      const slots = Array.isArray(payload?.slots) ? payload.slots : [];
      return slots.map((slot) => ({
        ...slot,
        courtId: slot.courtId || payload?.courtId,
        courtName: slot.courtName || payload?.courtName,
      }));
    },
  });

export const useVenueAvailability = (venueId, date, courtId) =>
  useAvailability(venueId, date, courtId);
