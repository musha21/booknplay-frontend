import { LAUNCH_CITY } from '../constants/locations';

export { LAUNCH_CITY };

export function buildVenueSearchParams({
  sportId,
  city,
  date,
  time,
  name,
  lat,
  lng,
  radiusKm,
  minPrice,
  maxPrice,
  amenity,
  indoorOutdoor,
  minRating,
  location,
} = {}) {
  const params = new URLSearchParams();
  const setIf = (key, value) => {
    if (value === undefined || value === null || String(value).trim() === '') return;
    params.set(key, String(value).trim());
  };
  setIf('sportId', sportId);
  setIf('city', city);
  setIf('location', location);
  setIf('date', date);
  setIf('time', time);
  setIf('name', name);
  setIf('lat', lat);
  setIf('lng', lng);
  setIf('radiusKm', radiusKm);
  setIf('minPrice', minPrice);
  setIf('maxPrice', maxPrice);
  setIf('amenity', amenity);
  setIf('indoorOutdoor', indoorOutdoor);
  setIf('minRating', minRating);
  return params;
}

export function buildVenueQuery({
  city,
  date,
  time,
  size = 24,
  sportId,
  lat,
  lng,
  radiusKm,
  minPrice,
  maxPrice,
  amenity,
  indoorOutdoor,
  minRating,
  name,
} = {}) {
  return {
    city: city?.trim() || undefined,
    sportId: sportId || undefined,
    date: date || undefined,
    time: time || undefined,
    lat: lat || undefined,
    lng: lng || undefined,
    radiusKm: radiusKm || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    amenity: amenity || undefined,
    indoorOutdoor: indoorOutdoor || undefined,
    minRating: minRating || undefined,
    name: name?.trim() || undefined,
    size,
    sort: 'createdAt,desc',
  };
}

export function buildKandyVenueQuery({ date, time, size = 24 } = {}) {
  return buildVenueQuery({ city: LAUNCH_CITY, date, time, size });
}

export function buildLegacySearchRedirect(search = '') {
  const current = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  const params = buildVenueSearchParams({
    sportId: current.get('sportId') || '',
    city: current.get('city') || LAUNCH_CITY,
    date: current.get('date') || '',
    time: current.get('time') || '',
  });

  return `/?${params.toString()}#venues`;
}

