export const SPLASH_SEEN_KEY = 'booknplay.splashSeen';

export function hasSeenSplash() {
  try {
    return window.localStorage.getItem(SPLASH_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markSplashSeen() {
  try {
    window.localStorage.setItem(SPLASH_SEEN_KEY, '1');
  } catch {
    // Ignore quota / private-mode failures; splash may replay next visit.
  }
}

/** True for public first visits only; skip owner/admin portal entry. */
export function shouldShowSplash(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  if (hasSeenSplash()) return false;
  const path = String(pathname || '/');
  if (/^\/owner(\/|$)/i.test(path) || /^\/admin(\/|$)/i.test(path)) return false;
  return true;
}
