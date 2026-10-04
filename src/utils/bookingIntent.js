const KEY = 'booknplay-booking-intent';
const IDEMPOTENCY_KEY = 'booknplay-booking-idempotency';

export function saveBookingIntent(intent) {
  if (!intent) return;
  sessionStorage.setItem(KEY, JSON.stringify(intent));
  sessionStorage.removeItem(IDEMPOTENCY_KEY);
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
  sessionStorage.removeItem(IDEMPOTENCY_KEY);
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

/** @deprecated Continuous range is no longer required; kept for tests/legacy callers. */
export function isOneContinuousRange(slots, courtId) {
  if (!Array.isArray(slots) || slots.length === 0) return true;
  const sorted = [...slots].sort((a, b) => toApiTime(a.startTime).localeCompare(toApiTime(b.startTime)));
  const id = String(courtId || sorted[0].courtId || '');
  const sameCourt = sorted.every((slot) => String(slot.courtId || id) === id);
  return sameCourt && sorted.every((slot, index) => (
    index === 0 || toApiTime(sorted[index - 1].endTime) === toApiTime(slot.startTime)
  ));
}

export function bookingRequestFromIntent(intent) {
  const slots = Array.isArray(intent?.slots) ? intent.slots : [];
  if (slots.length === 0) {
    return { ok: false, message: 'Choose a time before checkout.' };
  }
  const sorted = [...slots].sort((a, b) => toApiTime(a.startTime).localeCompare(toApiTime(b.startTime)));
  const courtId = String(intent?.courtId || sorted[0].courtId || '');
  const sportId = String(intent?.sportId || sorted[0].sportId || '');
  const sameCourt = sorted.every((slot) => String(slot.courtId || courtId) === courtId);
  if (!sameCourt) {
    return { ok: false, message: 'All selected slots must be on the same court.' };
  }
  if (!sportId) {
    return { ok: false, message: 'This court is missing a sport. Go back and choose the slot again.' };
  }
  return {
    ok: true,
    message: '',
    request: {
      courtId,
      sportId,
      date: intent.date,
      slots: sorted.map((slot) => ({
        startTime: toApiTime(slot.startTime),
        endTime: toApiTime(slot.endTime),
      })),
    },
  };
}

export function bookingIdempotencyKey() {
  let key = sessionStorage.getItem(IDEMPOTENCY_KEY);
  if (!key) {
    key = globalThis.crypto?.randomUUID?.()
      || `booking-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(IDEMPOTENCY_KEY, key);
  }
  return key;
}
