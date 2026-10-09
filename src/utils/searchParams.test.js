import { describe, expect, it } from 'vitest';
import { buildKandyVenueQuery, buildLegacySearchRedirect, buildVenueQuery, buildVenueSearchParams } from './searchParams';

describe('buildVenueSearchParams', () => {
  it('uses only API-supported filters and trims search text', () => {
    const params = buildVenueSearchParams({ sportId: 4, city: '  Kandy  ', date: '2026-09-20', name: '  Arena ' });
    expect(params.toString()).toBe('sportId=4&city=Kandy&date=2026-09-20&name=Arena');
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

describe('buildVenueQuery', () => {
  it('accepts explicit city and formats parameters without sportId', () => {
    expect(buildVenueQuery({ city: 'Katugastota', date: '2026-10-10', time: '18:30', sportId: '4' })).toEqual({
      city: 'Katugastota',
      sportId: '4',
      date: '2026-10-10',
      time: '18:30',
      lat: undefined,
      lng: undefined,
      radiusKm: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      amenity: undefined,
      indoorOutdoor: undefined,
      minRating: undefined,
      name: undefined,
      size: 24,
      sort: 'createdAt,desc',
    });
  });

  it('omits city when city is not provided', () => {
    expect(buildVenueQuery({ date: '2026-10-10' })).toEqual({
      city: undefined,
      sportId: undefined,
      date: '2026-10-10',
      time: undefined,
      lat: undefined,
      lng: undefined,
      radiusKm: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      amenity: undefined,
      indoorOutdoor: undefined,
      minRating: undefined,
      name: undefined,
      size: 24,
      sort: 'createdAt,desc',
    });
  });
});

describe('buildKandyVenueQuery', () => {
  it('always restricts homepage venue discovery to Kandy', () => {
    expect(buildKandyVenueQuery({ date: '2026-10-10', time: '18:30' })).toEqual({
      city: 'Kandy',
      sportId: undefined,
      date: '2026-10-10',
      time: '18:30',
      lat: undefined,
      lng: undefined,
      radiusKm: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      amenity: undefined,
      indoorOutdoor: undefined,
      minRating: undefined,
      name: undefined,
      size: 24,
      sort: 'createdAt,desc',
    });
  });
});

