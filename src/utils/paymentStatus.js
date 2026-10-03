import { PaymentStatus } from '../constants/apiTypes';

/** Shown while a soft-hold is active (matches backend hold TTL). */
export const PAYMENT_HOLD_NOTICE =
  'Your court is held for 5 minutes while you pay. If payment isn’t finished in time, the slot becomes available again.';

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

export function paymentReturnOutcome({ bookingId, serverStatus, isLoading, isError }) {
  if (!String(bookingId || '').trim()) return 'invalid';
  const reported = String(serverStatus ?? '').trim();
  if (!reported) return isError && !isLoading ? 'error' : 'pending';
  return classifyPaymentStatus(reported);
}

export function paymentRedirectUrl(payment) {
  const url = String(payment?.paymentUrl || '').trim();
  if (!url || classifyPaymentStatus(payment?.status) !== 'pending') return '';
  return url;
}
