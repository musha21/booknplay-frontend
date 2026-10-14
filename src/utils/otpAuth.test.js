import { describe, expect, it } from 'vitest';
import {
  isPlausibleSriLankaPhone,
  resolveOtpVerifyResult,
  unwrapAuthPayload,
} from './otpAuth';

describe('otpAuth helpers', () => {
  it('unwraps nested ApiResponse envelopes', () => {
    expect(unwrapAuthPayload({ data: { data: { accessToken: 'a' } } })).toEqual({ accessToken: 'a' });
    expect(unwrapAuthPayload({ data: { verificationToken: 't' } })).toEqual({
      verificationToken: 't',
    });
  });

  it('detects registration verificationToken branch', () => {
    const result = resolveOtpVerifyResult({
      verified: true,
      registrationRequired: true,
      verificationToken: 'tok-123',
    });
    expect(result.type).toBe('register');
    expect(result.verificationToken).toBe('tok-123');
  });

  it('validates plausible Sri Lankan mobiles', () => {
    expect(isPlausibleSriLankaPhone('0771234567')).toBe(true);
    expect(isPlausibleSriLankaPhone('+94771234567')).toBe(true);
    expect(isPlausibleSriLankaPhone('123')).toBe(false);
  });
});
