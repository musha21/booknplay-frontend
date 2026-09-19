import { describe, expect, it } from 'vitest';
import { continueAfterAuth, toApiTime } from './bookingIntent';

describe('continueAfterAuth', () => {
  it('returns the booking checkout path after customer login', () => {
    const intent = { venueId: 'v1', slots: [{ startTime: '10:00' }] };
    expect(
      continueAfterAuth({
        from: { pathname: '/checkout', state: intent },
      })
    ).toEqual({ pathname: '/checkout', state: intent });
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
