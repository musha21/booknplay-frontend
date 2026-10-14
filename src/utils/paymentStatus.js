import { PaymentStatus } from '../constants/apiTypes';

/** Shown while a soft-hold is active (matches backend hold TTL). */
export const PAYMENT_HOLD_NOTICE =
  'Your court is held for 10 minutes while you pay. If payment isn’t finished in time, the slot becomes available again.';

/** Poll cadence on the PayHere return page. */
export const PAYMENT_RETURN_POLL_MS = 3000;
/** ~2 minutes of polling before showing a timeout state. */
export const PAYMENT_RETURN_MAX_ATTEMPTS = 40;

const PENDING = new Set([
  PaymentStatus.INITIATED,
  PaymentStatus.PROCESSING,
  'PENDING',
]);

const CONFIRMED = new Set([
  PaymentStatus.SUCCESS,
  PaymentStatus.PAID,
  'COMPLETED',
]);

export function classifyPaymentStatus(status) {
  const value = String(status ?? '').trim().toUpperCase();
  if (PENDING.has(value)) return 'pending';
  if (CONFIRMED.has(value)) return 'confirmed';
  if (value === PaymentStatus.REFUNDED) return 'refunded';
  if (value === PaymentStatus.PARTIALLY_REFUNDED || value === 'PARTIAL') return 'partial';
  return 'failed';
}

export function paymentReturnOutcome({ bookingId, serverStatus, isLoading, isError, timedOut = false }) {
  if (!String(bookingId || '').trim()) return 'invalid';
  const reported = String(serverStatus ?? '').trim();
  if (!reported) return isError && !isLoading ? 'error' : 'pending';
  const classified = classifyPaymentStatus(reported);
  if (classified === 'pending' && timedOut) return 'timeout';
  return classified;
}

/**
 * Prefer bookingId; fall back to PayHere order_id / reference query params.
 * @param {URLSearchParams | { get: (key: string) => string | null }} params
 */
export function paymentReturnBookingParams(params) {
  const bookingId = String(params?.get?.('bookingId') || '').trim();
  const orderId = String(
    params?.get?.('order_id')
    || params?.get?.('orderId')
    || params?.get?.('reference')
    || '',
  ).trim();
  return { bookingId, orderId };
}

/**
 * Gateway checkout URL while payment is still pending.
 * Return-page UI must not auto-assign this (user already returned from PayHere);
 * use it only for an explicit “Continue payment” action.
 */
export function paymentRedirectUrl(payment) {
  const url = String(payment?.paymentUrl || '').trim();
  if (!url || classifyPaymentStatus(payment?.status) !== 'pending') return '';
  return url;
}

export function paymentReturnPollInterval(query) {
  const status = query?.state?.data?.status;
  if (classifyPaymentStatus(status) !== 'pending') return false;
  const attempts = Number(query?.state?.dataUpdateCount ?? 0);
  if (attempts >= PAYMENT_RETURN_MAX_ATTEMPTS) return false;
  return PAYMENT_RETURN_POLL_MS;
}

export function isPaymentReturnTimedOut(query) {
  const status = query?.state?.data?.status;
  if (classifyPaymentStatus(status) !== 'pending' && String(status ?? '').trim()) return false;
  const attempts = Number(query?.state?.dataUpdateCount ?? 0);
  return attempts >= PAYMENT_RETURN_MAX_ATTEMPTS;
}

export function bookingStatusChrome(status) {
  const value = String(status ?? '').trim().toUpperCase();
  switch (value) {
    case 'CONFIRMED':
      return '!bg-emerald-100 !text-emerald-700';
    case 'PENDING':
      return '!bg-amber-100 !text-amber-800';
    case 'CANCELLED':
      return '!bg-slate-100 !text-slate-700';
    case 'COMPLETED':
      return '!bg-sky-100 !text-sky-800';
    case 'FAILED':
    default:
      return '!bg-red-100 !text-red-700';
  }
}
