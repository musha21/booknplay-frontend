const EARTH_KM = 6371;

export function haversineKm(lat1, lng1, lat2, lng2) {
  const a = Number(lat1);
  const b = Number(lng1);
  const c = Number(lat2);
  const d = Number(lng2);
  if (![a, b, c, d].every(Number.isFinite)) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(c - a);
  const dLng = toRad(d - b);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceKm(km) {
  if (km == null || !Number.isFinite(km)) return '';
  if (km < 1) return `${Math.max(50, Math.round(km * 1000))} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}
