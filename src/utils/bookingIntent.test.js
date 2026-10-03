import { beforeEach, describe, expect, it } from 'vitest';
import { bookingRequestFromIntent, clearBookingIntent, continueAfterAuth, isOneContinuousRange, saveBookingIntent, toApiTime } from './bookingIntent';

const slotIntent = {
  venueId: 'v1',
  courtId: 'court-1',
  date: '2026-10-10',
  slots: [{ courtId: 'court-1', startTime: '10:00', endTime: '11:00' }],
};

describe('continueAfterAuth', () => {
  beforeEach(() => {
    clearBookingIntent();
  });

  it('returns the booking checkout path after customer login', () => {
    const intent = { venueId: 'v1', slots: [{ startTime: '10:00' }] };
    expect(
      continueAfterAuth({
        from: { pathname: '/checkout', state: intent },
      })
    ).toEqual({ pathname: '/checkout', state: intent });
  });

  it('keeps the same court, date, and slots after registration', () => {
    expect(continueAfterAuth({
      reason: 'booking',
      from: { pathname: '/checkout', state: slotIntent },
    })).toEqual({ pathname: '/checkout', state: slotIntent });
  });

  it('restores the saved court, date, and slots when router state is missing', () => {
    saveBookingIntent(slotIntent);
    expect(continueAfterAuth({})).toEqual({ pathname: '/checkout', state: slotIntent });
  });

  it('falls back to account when there is no booking in progress', () => {
    expect(continueAfterAuth({})).toEqual({ pathname: '/account' });
  });
});

describe('toApiTime', () => {
  it('normalizes hour strings and arrays for the booking API', () => {
    expect(toApiTime('09:00')).toBe('09:00:00');
    expect(toApiTime([9, 30])).toBe('09:30:00');
  });
});

describe('bookingRequestFromIntent', () => {
  const intent = {
    courtId: 'court-b',
    resourceLabel: 'Pitch',
    sportId: 'cricket',
    date: '2026-09-20',
  };

  it('sends discrete slots for a continuous block', () => {
    const result = bookingRequestFromIntent({
      ...intent,
      slots: [
        { startTime: '18:00', endTime: '19:00', courtId: 'court-b' },
        { startTime: '17:00', endTime: '18:00', courtId: 'court-b' },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.request).toEqual({
      courtId: 'court-b',
      sportId: 'cricket',
      date: '2026-09-20',
      slots: [
        { startTime: '17:00:00', endTime: '18:00:00' },
        { startTime: '18:00:00', endTime: '19:00:00' },
      ],
    });
  });

  it('allows gapped unordered slots without filling the middle hours', () => {
    const slots = [
      { startTime: '17:00', endTime: '18:00', courtId: 'court-b' },
      { startTime: '19:00', endTime: '20:00', courtId: 'court-b' },
    ];
    expect(isOneContinuousRange(slots, 'court-b')).toBe(false);
    const result = bookingRequestFromIntent({ ...intent, slots });
    expect(result.ok).toBe(true);
    expect(result.request.slots).toEqual([
      { startTime: '17:00:00', endTime: '18:00:00' },
      { startTime: '19:00:00', endTime: '20:00:00' },
    ]);
    expect(result.request.startTime).toBeUndefined();
    expect(result.request.endTime).toBeUndefined();
  });
});
