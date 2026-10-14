import { describe, expect, it } from 'vitest';
import { KANDY_CENTER } from '../lib/googleMaps';
import { KANDY_SERVICE_RADIUS_KM, venueInKandyServiceArea } from './locationConfig';

describe('venueInKandyServiceArea', () => {
  it('includes venues whose city matches a Kandy neighborhood', () => {
    expect(venueInKandyServiceArea({ city: 'Peradeniya' })).toBe(true);
    expect(venueInKandyServiceArea({ city: 'Katugastota', latitude: null, longitude: null })).toBe(true);
  });

  it('includes venues with Kandy in address text even without coordinates', () => {
    expect(venueInKandyServiceArea({
      formattedAddress: '12 Temple St, Kandy',
      latitude: null,
      longitude: null,
    })).toBe(true);
  });

  it('includes venues within the service radius of Kandy center', () => {
    expect(venueInKandyServiceArea({
      city: 'Unknown',
      latitude: KANDY_CENTER.lat + 0.05,
      longitude: KANDY_CENTER.lng,
    })).toBe(true);
  });

  it('excludes venues far from Kandy with no area text match', () => {
    expect(venueInKandyServiceArea({
      city: 'Colombo',
      latitude: 6.9271,
      longitude: 79.8612,
    })).toBe(false);
  });

  it('excludes venues with neither area text nor coordinates', () => {
    expect(venueInKandyServiceArea({ city: 'Colombo', latitude: null, longitude: null })).toBe(false);
    expect(venueInKandyServiceArea({})).toBe(false);
  });

  it('exports a 50 km service radius matching Maps bias', () => {
    expect(KANDY_SERVICE_RADIUS_KM).toBe(50);
  });
});
