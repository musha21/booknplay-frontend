import { describe, expect, it } from 'vitest';
import { facilityLabel, matchingCourts, sportAccent, sportIcon, venueDisplayAddress, venueGoogleMapsUrl, venueMatchingPrice, venueOperatorName, venueSportLabel } from './venue';
import {
  Casino,
  Pool,
  SportsBasketball,
  SportsCricket,
  SportsSoccer,
  SportsTennis,
  SportsVolleyball,
} from '@mui/icons-material';

describe('sportAccent', () => {
  it('keeps cricket lime and football blue without a field background', () => {
    expect(sportAccent('Indoor Cricket')).toBe('#84cc16');
    expect(sportAccent('Futsal / Indoor Football')).toBe('#3b82f6');
  });
});

describe('sportIcon', () => {
  it('returns appropriate icon for each sport', () => {
    expect(sportIcon('Indoor Cricket')).toBe(SportsCricket);
    expect(sportIcon('Futsal / Football')).toBe(SportsSoccer);
    expect(sportIcon('Basketball')).toBe(SportsBasketball);
    expect(sportIcon('Volleyball')).toBe(SportsVolleyball);
    expect(sportIcon('8-Ball Pool Table')).toBe(Casino);
    expect(sportIcon('Swimming Lane')).toBe(Pool);
    expect(sportIcon('Badminton')).toBe(SportsTennis);
    expect(sportIcon('Tennis')).toBe(SportsTennis);
  });
});

describe('venueSportLabel', () => {
  it('prefers unique court sport names over venue-level fallbacks', () => {
    expect(venueSportLabel({
      sportName: 'Multi',
      courts: [{ sportName: 'Indoor Cricket' }, { sportName: 'Indoor Cricket' }],
    })).toBe('Indoor Cricket');
    expect(venueSportLabel({
      courts: [{ sportName: 'Badminton' }, { sportName: 'Futsal' }],
    })).toBe('Badminton +1');
    expect(venueSportLabel({ sportName: 'Padel' })).toBe('Padel');
    expect(venueSportLabel({})).toBe('Multi-sport venue');
  });
});

describe('venueDisplayAddress', () => {
  it('prefers physical address before falling back to formattedAddress or city', () => {
    expect(venueDisplayAddress({ address: '123 Peradeniya Rd', formattedAddress: 'Kandy Complex', city: 'Kandy' })).toBe('123 Peradeniya Rd');
    expect(venueDisplayAddress({ formattedAddress: 'Katugastota Sports Centre', city: 'Katugastota' })).toBe('Katugastota Sports Centre');
    expect(venueDisplayAddress({ city: 'Kundasale' })).toBe('Kundasale');
    expect(venueDisplayAddress({})).toBe('Sri Lanka');
    expect(venueDisplayAddress(null)).toBe('');
  });
});

describe('venueGoogleMapsUrl', () => {
  it('prefers coordinates when both latitude and longitude are finite', () => {
    expect(venueGoogleMapsUrl({ latitude: 7.2906, longitude: 80.6337, address: 'Kandy' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=7.2906,80.6337',
    );
  });

  it('falls back to an encoded address query when coordinates are missing', () => {
    expect(venueGoogleMapsUrl({ address: '123 Peradeniya Rd' })).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('123 Peradeniya Rd')}`,
    );
    expect(venueGoogleMapsUrl(null)).toBe('');
  });
});

describe('venueOperatorName', () => {
  it('extracts operator name from businessName or nested business object', () => {
    expect(venueOperatorName({ businessName: 'Apex Sports Pvt Ltd' })).toBe('Apex Sports Pvt Ltd');
    expect(venueOperatorName({ business: { name: 'Kandy Arena Group' } })).toBe('Kandy Arena Group');
    expect(venueOperatorName({})).toBe('');
    expect(venueOperatorName(null)).toBe('');
  });
});

describe('facilityLabel', () => {
  it('maps the backend enum values to display text, case-insensitively', () => {
    expect(facilityLabel('INDOOR')).toBe('Indoor');
    expect(facilityLabel('outdoor')).toBe('Outdoor');
    expect(facilityLabel('')).toBe('');
    expect(facilityLabel(null)).toBe('');
    expect(facilityLabel('ROOFTOP')).toBe('ROOFTOP');
  });
});

describe('matchingCourts', () => {
  const venue = {
    courts: [
      { sportId: 'cricket', facilityType: 'INDOOR', hourlyRate: 3000, status: 'ACTIVE' },
      { sportId: 'cricket', facilityType: 'OUTDOOR', hourlyRate: 2000, status: 'ACTIVE' },
      { sportId: 'carrom', facilityType: 'INDOOR', hourlyRate: 800, status: 'ACTIVE' },
      { sportId: 'cricket', facilityType: 'INDOOR', hourlyRate: 9999, status: 'CLOSED' },
    ],
  };

  it('requires the SAME court to satisfy both sport and facility', () => {
    expect(matchingCourts(venue, { sportId: 'cricket', facility: 'OUTDOOR' })).toHaveLength(1);
    expect(matchingCourts(venue, { sportId: 'cricket', facility: 'OUTDOOR' })[0].hourlyRate).toBe(2000);
  });

  it('ignores inactive courts', () => {
    expect(matchingCourts(venue, { sportId: 'cricket', facility: 'INDOOR' })).toHaveLength(1);
    expect(matchingCourts(venue, { sportId: 'cricket', facility: 'INDOOR' })[0].hourlyRate).toBe(3000);
  });

  it('filters by facility only when no sport is selected', () => {
    expect(matchingCourts(venue, { facility: 'INDOOR' }).map((c) => c.sportId).sort())
      .toEqual(['carrom', 'cricket']);
  });
});

describe('venueMatchingPrice', () => {
  const venue = {
    startingPrice: 5000,
    courts: [
      { sportId: 'cricket', facilityType: 'INDOOR', hourlyRate: 3000, status: 'ACTIVE' },
      { sportId: 'cricket', facilityType: 'INDOOR', hourlyRate: 2500, status: 'ACTIVE' },
      { sportId: 'badminton', facilityType: 'OUTDOOR', hourlyRate: 900, status: 'ACTIVE' },
    ],
  };

  it('falls back to the venue starting price when no filter is active', () => {
    expect(venueMatchingPrice(venue, {})).toBe(5000);
  });

  it('uses the cheapest matching court when a filter is active', () => {
    expect(venueMatchingPrice(venue, { sportId: 'cricket', facility: 'INDOOR' })).toBe(2500);
  });

  it('never reports an unrelated court price as the selected sport price', () => {
    // Badminton is 900 but a cricket filter must reflect a cricket court, not 900.
    expect(venueMatchingPrice(venue, { sportId: 'cricket', facility: 'OUTDOOR' })).toBe(5000);
  });
});


