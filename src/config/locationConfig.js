import { KANDY_AREAS, LAUNCH_CITY } from '../constants/locations';

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
