import { describe, expect, it } from 'vitest';
import { buildVenueSearchParams } from './searchParams';

describe('buildVenueSearchParams', () => {
  it('uses only API-supported filters and trims search text', () => {
    const params = buildVenueSearchParams({ sportId: 4, city: '  Kandy  ', date: '2026-09-20', name: '  Arena ' });
    expect(params.toString()).toBe('sportId=4&city=Kandy&date=2026-09-20&name=Arena');
  });

  it('omits empty filters', () => {
    expect(buildVenueSearchParams({ city: ' ', sportId: '' }).toString()).toBe('');
  });
});

