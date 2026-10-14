import { describe, expect, it } from 'vitest';
import { formatBookingTimes } from './formatters';

describe('formatBookingTimes', () => {
  it('lists gapped slots instead of the envelope', () => {
    expect(formatBookingTimes({
      startTime: '10:00:00',
      endTime: '14:00:00',
      slots: [
        { startTime: '10:00:00', endTime: '11:00:00' },
        { startTime: '13:00:00', endTime: '14:00:00' },
      ],
    })).toBe('10:00 AM - 11:00 AM, 01:00 PM - 02:00 PM');
  });

  it('merges contiguous hours', () => {
    expect(formatBookingTimes({
      slots: [
        { startTime: '10:00:00', endTime: '11:00:00' },
        { startTime: '11:00:00', endTime: '12:00:00' },
      ],
    })).toBe('10:00 AM - 12:00 PM');
  });

  it('falls back to envelope when slots are missing', () => {
    expect(formatBookingTimes({
      startTime: '18:00:00',
      endTime: '19:00:00',
    })).toBe('06:00 PM - 07:00 PM');
  });
});
