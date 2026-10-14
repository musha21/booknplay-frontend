const KEY = 'booknplay.recentlyViewedVenues';
const MAX = 8;

export function readRecentlyViewed() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function rememberVenue(venueId) {
  if (!venueId) return readRecentlyViewed();
  const id = String(venueId);
  const next = [id, ...readRecentlyViewed().filter((item) => item !== id)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}
