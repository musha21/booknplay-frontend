export function buildVenueSearchParams({ sportId, city, date, time, name } = {}) {
  const params = new URLSearchParams();
  if (sportId) params.set('sportId', String(sportId));
  if (city?.trim()) params.set('city', city.trim());
  if (date) params.set('date', date);
  if (time) params.set('time', time);
  if (name?.trim()) params.set('name', name.trim());
  return params;
}
