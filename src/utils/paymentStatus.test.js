import { describe, expect, it } from 'vitest';
import { classifyPaymentStatus, paymentRedirectUrl, paymentReturnOutcome } from './paymentStatus';

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
});

describe('paymentRedirectUrl', () => {
  it('follows a gateway URL only while the server status is still pending', () => {
    expect(paymentRedirectUrl({ status: 'PROCESSING', paymentUrl: 'https://pay.example/checkout' })).toBe('https://pay.example/checkout');
    expect(paymentRedirectUrl({ status: 'SUCCESS', paymentUrl: 'https://pay.example/checkout' })).toBe('');
    expect(paymentRedirectUrl({ status: 'SUCCESS' })).toBe('');
  });
});
