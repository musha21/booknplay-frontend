export const KANDY_CENTER = { lat: 7.2906, lng: 80.6337 };

/** ~50 km bias around Kandy (matches previous ~0.45° Autocomplete bounds). */
const KANDY_BIAS_RADIUS_M = 50_000;

export function mapsJsKey() {
  return String(import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '').trim();
}

export function placesKey() {
  return String(import.meta.env.VITE_GOOGLE_PLACES_KEY || '').trim();
}

export function geocodingKey() {
  return String(import.meta.env.VITE_GOOGLE_GEOCODING_KEY || '').trim();
}

/** True when either Maps JS or Places browser key is configured. */
export function hasMapsJsKey() {
  return Boolean(mapsJsKey() || placesKey());
}

/** Detect Places API (New) permission / 403-style failures without exposing key details. */
export function isPlacesPermissionError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  const code = String(error?.code || error?.status || error?.statusCode || '').toUpperCase();
  if (code === 'PERMISSION_DENIED' || code === 'REQUEST_DENIED' || code === '403') return true;
  return (
    message.includes('403')
    || message.includes('permission')
    || message.includes('request_denied')
    || message.includes('request denied')
    || message.includes('not authorized')
    || message.includes('api key')
    || message.includes('apikey')
    || message.includes('places api')
    || message.includes('legacy api')
  );
}

export const PLACES_PERMISSION_HINT =
  'Places search blocked — enable Places API (New) and allow it on your browser key (HTTP referrers must include this site).';

let mapsPromise;
let placesPromise;

function browserMapsKey() {
  return mapsJsKey() || placesKey();
}

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

/**
 * Loads Maps JavaScript API only (Map, Marker, Geocoder).
 * Does not load Places — so pin maps still work when Places API (New) is blocked.
 */
export function loadGoogleMaps() {
  if (mapsPromise) return mapsPromise;
  const key = browserMapsKey();
  if (!key) return Promise.reject(new Error('Google Maps key is not configured'));

  if (window.google?.maps) {
    mapsPromise = Promise.resolve(window.google);
    return mapsPromise;
  }

  // Prefer a places-free script URL so Maps core is not tied to Places enablement.
  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
  mapsPromise = loadScript(src)
    .then((google) => {
      if (!google?.maps) throw new Error('Google Maps failed to load');
      return google;
    })
    .catch((error) => {
      mapsPromise = undefined;
      throw error;
    });
  return mapsPromise;
}

/** Loads Places API (New) library after Maps core is available. */
export async function loadPlacesLibrary() {
  if (placesPromise) return placesPromise;
  placesPromise = (async () => {
    const google = await loadGoogleMaps();
    if (typeof google.maps.importLibrary === 'function') {
      await google.maps.importLibrary('places');
    }
    return google;
  })().catch((error) => {
    placesPromise = undefined;
    throw error;
  });
  return placesPromise;
}

function componentLongName(item) {
  return item?.long_name || item?.longText || item?.longName || '';
}

function cityFromComponents(components = []) {
  const find = (...types) => components.find((item) => types.every((type) => item.types?.includes(type)));
  const hit = find('locality')
    || find('administrative_area_level_2')
    || find('administrative_area_level_3')
    || find('sublocality', 'sublocality_level_1')
    || find('administrative_area_level_1');
  return componentLongName(hit) || '';
}

function latLngParts(loc) {
  if (!loc) return null;
  const latitude = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
  const longitude = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
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

/** Maps legacy PlaceResult or Places API (New) Place → BooknPlay location contract. */
export function placeToLocation(place) {
  if (!place) return null;

  const coords = latLngParts(place.location)
    || latLngParts(place.geometry?.location);
  if (!coords) return null;

  const components = place.addressComponents || place.address_components || [];
  const displayName = typeof place.displayName === 'string'
    ? place.displayName
    : place.displayName?.text || place.name || '';
  const formattedAddress = place.formattedAddress
    || place.formatted_address
    || displayName
    || '';

  return {
    formattedAddress,
    latitude: coords.latitude,
    longitude: coords.longitude,
    city: cityFromComponents(components) || displayName || '',
  };
}

export async function createPlacesSessionToken() {
  const google = await loadPlacesLibrary();
  const { AutocompleteSessionToken } = await google.maps.importLibrary('places');
  return new AutocompleteSessionToken();
}

/**
 * Places API (New) autocomplete suggestions, biased to Kandy and restricted to LK.
 * Returns [{ id, label, prediction }] — prediction is a PlacePrediction for resolvePlacePrediction.
 */
export async function fetchPlaceSuggestions(input, { sessionToken } = {}) {
  const query = String(input || '').trim();
  if (!query) return [];

  const google = await loadPlacesLibrary();
  const { AutocompleteSuggestion } = await google.maps.importLibrary('places');

  const request = {
    input: query,
    includedRegionCodes: ['lk'],
    locationBias: {
      center: KANDY_CENTER,
      radius: KANDY_BIAS_RADIUS_M,
    },
  };
  if (sessionToken) request.sessionToken = sessionToken;

  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
  return (suggestions || [])
    .map((suggestion, index) => {
      const prediction = suggestion?.placePrediction;
      if (!prediction) return null;
      const text = prediction.text;
      const label = typeof text === 'string'
        ? text
        : text?.text || text?.toString?.() || prediction.mainText?.text || '';
      return {
        id: prediction.placeId || `suggestion-${index}`,
        label: String(label || '').trim(),
        prediction,
      };
    })
    .filter((item) => item?.label);
}

/** Resolve a PlacePrediction to the BooknPlay location contract via Place Details (New). */
export async function resolvePlacePrediction(placePrediction) {
  if (!placePrediction?.toPlace) return null;
  await loadPlacesLibrary();
  const place = placePrediction.toPlace();
  await place.fetchFields({
    fields: ['formattedAddress', 'location', 'displayName', 'addressComponents'],
  });
  return placeToLocation(place);
}
