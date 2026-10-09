export const KANDY_CENTER = { lat: 7.2906, lng: 80.6337 };

export function mapsJsKey() {
  return String(import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '').trim();
}

export function placesKey() {
  return String(import.meta.env.VITE_GOOGLE_PLACES_KEY || '').trim();
}

export function geocodingKey() {
  return String(import.meta.env.VITE_GOOGLE_GEOCODING_KEY || '').trim();
}

export function hasMapsJsKey() {
  return Boolean(mapsJsKey());
}

let mapsPromise;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.google?.maps) {
        resolve(window.google);
        return;
      }
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(window.google));
    script.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
    document.head.appendChild(script);
  });
}

/** Loads Maps JavaScript API with Places library (JS key). */
export function loadGoogleMaps() {
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (mapsPromise) return mapsPromise;
  const key = mapsJsKey() || placesKey();
  if (!key) return Promise.reject(new Error('Google Maps key is not configured'));
  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly`;
  mapsPromise = loadScript(src).then((google) => {
    if (!google?.maps) throw new Error('Google Maps failed to load');
    return google;
  }).catch((error) => {
    mapsPromise = undefined;
    throw error;
  });
  return mapsPromise;
}

function cityFromComponents(components = []) {
  const find = (...types) => components.find((item) => types.every((type) => item.types?.includes(type)))?.long_name;
  return find('locality')
    || find('administrative_area_level_2')
    || find('administrative_area_level_3')
    || find('sublocality', 'sublocality_level_1')
    || find('administrative_area_level_1')
    || '';
}

export async function geocodeAddress(address) {
  const query = String(address || '').trim();
  if (!query) return null;
  const restKey = geocodingKey();
  if (restKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=lk&key=${encodeURIComponent(restKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      const hit = data?.results?.[0];
      if (hit?.geometry?.location) {
        return {
          formattedAddress: hit.formatted_address,
          latitude: hit.geometry.location.lat,
          longitude: hit.geometry.location.lng,
          city: cityFromComponents(hit.address_components),
        };
      }
    } catch {
      /* fall through to Maps JS Geocoder */
    }
  }
  const google = await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ address: query, region: 'LK' });
  const hit = response?.results?.[0];
  if (!hit?.geometry?.location) return null;
  return {
    formattedAddress: hit.formatted_address,
    latitude: hit.geometry.location.lat(),
    longitude: hit.geometry.location.lng(),
    city: cityFromComponents(hit.address_components),
  };
}

export async function reverseGeocode(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const restKey = geocodingKey();
  if (restKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${encodeURIComponent(restKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      const hit = data?.results?.[0];
      if (hit) {
        return {
          formattedAddress: hit.formatted_address,
          latitude,
          longitude,
          city: cityFromComponents(hit.address_components),
        };
      }
    } catch {
      /* fall through */
    }
  }
  const google = await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
  const hit = response?.results?.[0];
  if (!hit) {
    return { formattedAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, latitude, longitude, city: '' };
  }
  return {
    formattedAddress: hit.formatted_address,
    latitude,
    longitude,
    city: cityFromComponents(hit.address_components),
  };
}

export function placeToLocation(place) {
  if (!place?.geometry?.location) return null;
  const loc = place.geometry.location;
  const latitude = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
  const longitude = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
  return {
    formattedAddress: place.formatted_address || place.name || '',
    latitude,
    longitude,
    city: cityFromComponents(place.address_components) || place.name || '',
  };
}
