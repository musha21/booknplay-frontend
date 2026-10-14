import { KANDY_AREAS, LAUNCH_CITY } from '../constants/locations';
import { KANDY_CENTER } from '../lib/googleMaps';
import { haversineKm } from '../utils/geo';

/** Matches Maps autocomplete bias (~50 km around Kandy center). */
export const KANDY_SERVICE_RADIUS_KM = 50;

export const LOCATION_CONFIG = {
  activeCity: LAUNCH_CITY,
  activeDistrict: 'Kandy',
  districts: [
    {
      id: 'kandy',
      name: 'Kandy',
      areas: KANDY_AREAS,
    },
  ],
};

export function getActiveAreas() {
  const current = LOCATION_CONFIG.districts.find(
    (d) => d.name.toLowerCase() === LOCATION_CONFIG.activeDistrict.toLowerCase(),
  );
  return current ? current.areas : KANDY_AREAS;
}

const serviceAreaTerms = () => {
  const terms = new Set([String(LAUNCH_CITY).toLowerCase()]);
  for (const area of getActiveAreas()) {
    const value = String(area?.value || '').trim().toLowerCase();
    if (value) terms.add(value);
  }
  return [...terms];
};

function venueLocationText(venue) {
  return [
    venue?.address,
    venue?.formattedAddress,
    venue?.city,
    venue?.locality,
    venue?.area,
  ]
    .filter(Boolean)
    .map((part) => String(part).toLowerCase())
    .join(' ');
}

export function venueMatchesArea(venue, selectedAreaValue) {
  if (!selectedAreaValue || selectedAreaValue === 'all' || selectedAreaValue === '') {
    return true;
  }
  const query = String(selectedAreaValue).toLowerCase();
  const address = String(venue.address || venue.formattedAddress || '').toLowerCase();
  const city = String(venue.city || '').toLowerCase();
  const locality = String(venue.locality || venue.area || '').toLowerCase();
  const name = String(venue.name || '').toLowerCase();

  return address.includes(query) || city.includes(query) || locality.includes(query) || name.includes(query);
}

/**
 * True when a venue belongs in the configured Kandy coverage area:
 * text match on city/address/locality against launch city or KANDY_AREAS,
 * or coordinates within KANDY_SERVICE_RADIUS_KM of KANDY_CENTER.
 * Missing coordinates are kept when text matches; otherwise excluded.
 */
export function venueInKandyServiceArea(venue) {
  if (!venue) return false;
  const text = venueLocationText(venue);
  if (text && serviceAreaTerms().some((term) => text.includes(term))) {
    return true;
  }
  const km = haversineKm(KANDY_CENTER.lat, KANDY_CENTER.lng, venue.latitude, venue.longitude);
  if (km == null) return false;
  return km <= KANDY_SERVICE_RADIUS_KM;
}
