import { describe, expect, it } from 'vitest';
import { AvailabilitySlotReason } from '../constants/apiTypes';
import { formatSlotReasonLabel, isSlotAvailable, resolveSlotReason } from './availability';

describe('availability utilities', () => {
  it('resolves available slots accurately', () => {
    const slot = { available: true, startTime: '10:00:00', endTime: '11:00:00', price: 2000 };
    expect(isSlotAvailable(slot)).toBe(true);
    expect(resolveSlotReason(slot)).toBe(AvailabilitySlotReason.AVAILABLE);
    expect(formatSlotReasonLabel(AvailabilitySlotReason.AVAILABLE)).toBe('Available');
  });

  it('maps unavailable reasons to documented standards', () => {
    expect(resolveSlotReason({ available: false, reason: 'HELD' })).toBe(AvailabilitySlotReason.HELD);
    expect(resolveSlotReason({ available: false, reason: 'PENDING' })).toBe(AvailabilitySlotReason.HELD);
    expect(resolveSlotReason({ available: false, reason: 'BLOCKED' })).toBe(AvailabilitySlotReason.BLOCKED);
    expect(resolveSlotReason({ available: false, reason: 'MAINTENANCE' })).toBe(AvailabilitySlotReason.MAINTENANCE);
    expect(resolveSlotReason({ available: false, reason: 'CLOSED' })).toBe(AvailabilitySlotReason.CLOSED);
    expect(resolveSlotReason({ available: false, reason: '' })).toBe(AvailabilitySlotReason.BOOKED);
  });

  it('formats user-friendly reason labels', () => {
    expect(formatSlotReasonLabel(AvailabilitySlotReason.HELD)).toBe('Reserved / Held');
    expect(formatSlotReasonLabel(AvailabilitySlotReason.BLOCKED)).toBe('Blocked');
    expect(formatSlotReasonLabel(AvailabilitySlotReason.MAINTENANCE)).toBe('Under maintenance');
    expect(formatSlotReasonLabel(AvailabilitySlotReason.CLOSED)).toBe('Closed');
    expect(formatSlotReasonLabel(AvailabilitySlotReason.BOOKED)).toBe('Booked');
  });
});
