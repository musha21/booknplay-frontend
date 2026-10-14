import { describe, expect, it } from 'vitest';
import {
  bookingStatusChrome,
  classifyPaymentStatus,
  isPaymentReturnTimedOut,
  paymentRedirectUrl,
  paymentReturnBookingParams,
  paymentReturnOutcome,
  paymentReturnPollInterval,
  PAYMENT_HOLD_NOTICE,
  PAYMENT_RETURN_MAX_ATTEMPTS,
  PAYMENT_RETURN_POLL_MS,
} from './paymentStatus';

describe('PAYMENT_HOLD_NOTICE', () => {
  it('states the soft-hold lasts 10 minutes', () => {
    expect(PAYMENT_HOLD_NOTICE).toMatch(/held for 10 minutes/i);
  });
});

describe('classifyPaymentStatus', () => {
  it('treats documented and gateway success labels as confirmed', () => {
    expect(classifyPaymentStatus('COMPLETED')).toBe('confirmed');
    expect(classifyPaymentStatus('success')).toBe('confirmed');
    expect(classifyPaymentStatus(' PAID ')).toBe('confirmed');
  });

  it('treats in-progress labels as pending', () => {
    expect(classifyPaymentStatus('PENDING')).toBe('pending');
    expect(classifyPaymentStatus('INITIATED')).toBe('pending');
    expect(classifyPaymentStatus('processing')).toBe('pending');
  });

  it('keeps refunded and partial distinct from a failed payment', () => {
    expect(classifyPaymentStatus('REFUNDED')).toBe('refunded');
    expect(classifyPaymentStatus('PARTIAL')).toBe('partial');
    expect(classifyPaymentStatus('FAILED')).toBe('failed');
  });

  it('treats an unknown or empty status as failed', () => {
    expect(classifyPaymentStatus('UNKNOWN')).toBe('failed');
    expect(classifyPaymentStatus('')).toBe('failed');
    expect(classifyPaymentStatus(null)).toBe('failed');
  });
});

describe('paymentReturnOutcome', () => {
  it('requires a booking id before any confirmation', () => {
    expect(paymentReturnOutcome({ bookingId: '', serverStatus: 'SUCCESS' })).toBe('invalid');
  });

  it('confirms only a status returned by the payment endpoint', () => {
    expect(paymentReturnOutcome({ bookingId: 'booking-1', serverStatus: 'SUCCESS', isLoading: false })).toBe('confirmed');
    expect(paymentReturnOutcome({ bookingId: 'booking-1', serverStatus: '', isLoading: true })).toBe('pending');
    expect(paymentReturnOutcome({ bookingId: 'booking-1', serverStatus: undefined, isError: true, isLoading: false })).toBe('error');
  });

  it('surfaces timeout while still pending after the poll cap', () => {
    expect(paymentReturnOutcome({
      bookingId: 'booking-1',
      serverStatus: 'PROCESSING',
      timedOut: true,
    })).toBe('timeout');
  });
});

describe('paymentRedirectUrl', () => {
  it('exposes a gateway URL only while the server status is still pending', () => {
    expect(paymentRedirectUrl({ status: 'PROCESSING', paymentUrl: 'https://pay.example/checkout' })).toBe('https://pay.example/checkout');
    expect(paymentRedirectUrl({ status: 'SUCCESS', paymentUrl: 'https://pay.example/checkout' })).toBe('');
    expect(paymentRedirectUrl({ status: 'SUCCESS' })).toBe('');
  });
});

describe('paymentReturnBookingParams', () => {
  it('reads bookingId and PayHere order/reference fallbacks', () => {
    const params = new URLSearchParams('order_id=BNP-1&reference=BNP-1');
    expect(paymentReturnBookingParams(params)).toEqual({ bookingId: '', orderId: 'BNP-1' });
    expect(paymentReturnBookingParams(new URLSearchParams('bookingId=b-9'))).toEqual({
      bookingId: 'b-9',
      orderId: '',
    });
  });
});

describe('paymentReturnPollInterval', () => {
  it('polls while pending and stops after the attempt cap or confirmation', () => {
    expect(paymentReturnPollInterval({
      state: { data: { status: 'PROCESSING' }, dataUpdateCount: 1 },
    })).toBe(PAYMENT_RETURN_POLL_MS);
    expect(paymentReturnPollInterval({
      state: { data: { status: 'SUCCESS' }, dataUpdateCount: 1 },
    })).toBe(false);
    expect(paymentReturnPollInterval({
      state: { data: { status: 'PROCESSING' }, dataUpdateCount: PAYMENT_RETURN_MAX_ATTEMPTS },
    })).toBe(false);
  });
});

describe('isPaymentReturnTimedOut', () => {
  it('flags timeout only after the poll cap while still pending', () => {
    expect(isPaymentReturnTimedOut({
      state: { data: { status: 'PROCESSING' }, dataUpdateCount: 3 },
    })).toBe(false);
    expect(isPaymentReturnTimedOut({
      state: { data: { status: 'PROCESSING' }, dataUpdateCount: PAYMENT_RETURN_MAX_ATTEMPTS },
    })).toBe(true);
    expect(isPaymentReturnTimedOut({
      state: { data: { status: 'SUCCESS' }, dataUpdateCount: PAYMENT_RETURN_MAX_ATTEMPTS },
    })).toBe(false);
  });
});

describe('bookingStatusChrome', () => {
  it('maps booking statuses to distinct chip styles', () => {
    expect(bookingStatusChrome('CONFIRMED')).toContain('emerald');
    expect(bookingStatusChrome('PENDING')).toContain('amber');
    expect(bookingStatusChrome('CANCELLED')).toContain('slate');
    expect(bookingStatusChrome('COMPLETED')).toContain('sky');
    expect(bookingStatusChrome('FAILED')).toContain('red');
  });
});
