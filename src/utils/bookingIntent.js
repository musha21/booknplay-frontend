const KEY = 'booknplay-booking-intent';

export function saveBookingIntent(intent) {
  if (!intent) return;
  sessionStorage.setItem(KEY, JSON.stringify(intent));
}

export function readBookingIntent() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBookingIntent() {
  sessionStorage.removeItem(KEY);
}

export function continueAfterAuth(locationState) {
  const from = locationState?.from;
  if (from?.pathname && from.pathname !== '/auth/login' && from.pathname !== '/auth/register') {
    return {
      pathname: `${from.pathname}${from.search || ''}`,
      state: from.state || readBookingIntent() || undefined,
    };
  }
  const intent = readBookingIntent();
  if (intent) {
    return { pathname: '/checkout', state: intent };
  }
  return { pathname: '/account' };
}

export function toApiTime(value) {
  if (value == null || value === '') return '00:00:00';
  if (Array.isArray(value)) {
    const [hours = 0, minutes = 0, seconds = 0] = value;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  const text = String(value);
  if (/^\d{2}:\d{2}$/.test(text)) return `${text}:00`;
  return text;
}
