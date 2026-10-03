import { describe, expect, it } from 'vitest';
import {
  ADVANCE_TYPES, DEFAULT_BOOKING_POLICY, FIXED_CANCEL_HOURS_AFTER_BOOKING,
  bookingPolicyPayload, normalizeBookingPolicy, policyExample, validateBookingPolicy,
} from './bookingPolicy';

describe('booking policy', () => {
  it('defaults existing venues to full payment with customer cancellation disabled', () => {
    expect(DEFAULT_BOOKING_POLICY.advanceRequired).toBe(true);
    expect(DEFAULT_BOOKING_POLICY.advanceType).toBe(ADVANCE_TYPES.PERCENTAGE);
    expect(DEFAULT_BOOKING_POLICY.advanceValue).toBe(100);
    expect(DEFAULT_BOOKING_POLICY.cancellationAllowed).toBe(false);
    expect(DEFAULT_BOOKING_POLICY.freeCancellationHours).toBe(FIXED_CANCEL_HOURS_AFTER_BOOKING);
  });

  it('calculates owner examples without making them part of the booking request', () => {
    const example = policyExample({
      ...DEFAULT_BOOKING_POLICY,
      advanceValue: 30,
    }, 4000);

    expect(example).toEqual({ total: 4000, payNow: 1200, balanceDue: 2800 });
    expect(bookingPolicyPayload(DEFAULT_BOOKING_POLICY)).toEqual({
      hoursBeforeDeadline: 0,
      refundPercentage: 0,
    });
  });

  it('rejects advance percentages above 100', () => {
    const policy = {
      ...DEFAULT_BOOKING_POLICY,
      advanceValue: 110,
      cancellationAllowed: true,
    };

    expect(validateBookingPolicy(policy)).toEqual([
      'Advance percentage cannot exceed 100%.',
    ]);
  });

  it('reloads a legacy deadline and partial refund percent as 1h full refund', () => {
    const loaded = normalizeBookingPolicy({ hoursBeforeDeadline: 12, refundPercentage: 60 });
    expect(loaded.cancellationAllowed).toBe(true);
    expect(loaded.freeCancellationHours).toBe(1);
    expect(loaded.lateCancellationRule).toEqual({
      refundBase: 'AMOUNT_PAID',
      feeType: 'NONE',
      feeValue: 0,
    });
  });

  it('sends the fixed 1h full-refund payload when cancellation is allowed', () => {
    expect(bookingPolicyPayload({
      ...DEFAULT_BOOKING_POLICY,
      cancellationAllowed: true,
      freeCancellationHours: 12,
      lateCancellationRule: {
        refundBase: 'AMOUNT_PAID',
        feeType: 'PERCENTAGE',
        feeValue: 40,
      },
    })).toEqual({ hoursBeforeDeadline: 1, refundPercentage: 100 });
  });

  it('disables cancel with a zero deadline and zero refund', () => {
    expect(bookingPolicyPayload({
      ...DEFAULT_BOOKING_POLICY,
      cancellationAllowed: false,
    })).toEqual({ hoursBeforeDeadline: 0, refundPercentage: 0 });
  });
});
