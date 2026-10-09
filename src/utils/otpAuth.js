/**
 * Unwrap Spring ApiResponse / axios envelope used by BooknPlay auth.
 */
export function unwrapAuthPayload(res) {
  return res?.data?.data || res?.data || res;
}

/**
 * Registration OTP verify returns { registrationRequired, verificationToken }.
 * (Everyday login no longer uses OTP.)
 */
export function resolveOtpVerifyResult(payload) {
  if (payload?.verificationToken) {
    return {
      type: 'register',
      verificationToken: payload.verificationToken,
      verified: payload.verified !== false,
      registrationRequired: payload.registrationRequired !== false,
    };
  }
  if (payload?.accessToken) {
    return { type: 'login', payload };
  }
  return { type: 'unknown', payload };
}

/** Light client-side check before calling the API (backend normalizes authoritatively). */
export function isPlausibleSriLankaPhone(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const digits = raw.trim().replace(/[\s\-()]/g, '');
  if (/^\+947\d{8}$/.test(digits)) return true;
  if (/^947\d{8}$/.test(digits)) return true;
  if (/^07\d{8}$/.test(digits)) return true;
  if (/^7\d{8}$/.test(digits)) return true;
  return false;
}
