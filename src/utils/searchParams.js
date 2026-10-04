import { LAUNCH_CITY } from '../constants/locations';

export { LAUNCH_CITY };

export function buildVenueSearchParams({ sportId, city, date, time, name } = {}) {
  const params = new URLSearchParams();
  if (sportId) params.set('sportId', String(sportId));
  if (city?.trim()) params.set('city', city.trim());
  if (date) params.set('date', date);
  if (time) params.set('time', time);
  if (name?.trim()) params.set('name', name.trim());
  return params;
}

export function buildVenueQuery({ city, date, time, size = 24 } = {}) {
  return {
    city: city?.trim() || undefined,
    date: date || undefined,
    time: time || undefined,
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

