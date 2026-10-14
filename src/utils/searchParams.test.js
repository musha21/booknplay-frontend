import { describe, expect, it } from 'vitest';
import { buildKandyVenueQuery, buildLegacySearchRedirect, buildVenueQuery, buildVenueSearchParams } from './searchParams';

describe('buildVenueSearchParams', () => {
  it('uses only API-supported filters and trims search text', () => {
    const params = buildVenueSearchParams({ sportId: 4, city: '  Kandy  ', date: '2026-09-20', name: '  Arena ' });
    expect(params.toString()).toBe('sportId=4&city=Kandy&date=2026-09-20&name=Arena');
  });

  it('includes businessId for partner deep-links', () => {
    expect(buildVenueSearchParams({ businessId: 'biz-9' }).toString()).toBe('businessId=biz-9');
  });

  it('omits empty filters', () => {
    expect(buildVenueSearchParams({ city: ' ', sportId: '' }).toString()).toBe('');
  });
});

describe('buildLegacySearchRedirect', () => {
  it('keeps supported filters when mapping old /search links', () => {
    expect(buildLegacySearchRedirect('?sportId=4&city=Peradeniya&date=2026-09-20&time=18%3A30&name=Arena'))
      .toBe('/?sportId=4&city=Peradeniya&date=2026-09-20&time=18%3A30#venues');
  });

  it('defaults to Kandy when city is not provided', () => {
    expect(buildLegacySearchRedirect('?name=Arena')).toBe('/?city=Kandy#venues');
  });
});

const emptyExtras = {
  businessId: undefined,
  lat: undefined,
  lng: undefined,
  radiusKm: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  amenity: undefined,
  facilityType: undefined,
  indoorOutdoor: undefined,
  minRating: undefined,
  name: undefined,
  size: 24,
  sort: 'createdAt,desc',
};

describe('buildVenueQuery', () => {
  it('accepts explicit city and formats parameters without sportId', () => {
    expect(buildVenueQuery({ city: 'Katugastota', date: '2026-10-10', time: '18:30', sportId: '4' })).toEqual({
      ...emptyExtras,
      city: 'Katugastota',
      sportId: '4',
      date: '2026-10-10',
      time: '18:30',
    });
  });

  it('passes businessId through for partner venue discovery', () => {
    expect(buildVenueQuery({ businessId: 'biz-1', size: 60 })).toEqual({
      ...emptyExtras,
      businessId: 'biz-1',
      city: undefined,
      sportId: undefined,
      date: undefined,
      time: undefined,
      size: 60,
    });
  });

  it('omits city when city is not provided', () => {
    expect(buildVenueQuery({ date: '2026-10-10' })).toEqual({
      ...emptyExtras,
      city: undefined,
      sportId: undefined,
      date: '2026-10-10',
      time: undefined,
    });
  });
});

describe('buildKandyVenueQuery', () => {
  it('omits city lock so FE can apply Kandy service-area membership', () => {
    expect(buildKandyVenueQuery({ date: '2026-10-10', time: '18:30' })).toEqual({
      ...emptyExtras,
      city: undefined,
      sportId: undefined,
      date: '2026-10-10',
      time: '18:30',
    });
  });
});
