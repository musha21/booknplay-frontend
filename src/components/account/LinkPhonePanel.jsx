import { useEffect, useState } from 'react';
import { useLinkPhoneRequestOtp, useLinkPhoneVerify } from '../../hooks/useAuth';
import { isPlausibleSriLankaPhone } from '../../utils/otpAuth';

const RESEND_SECONDS = 60;

export default function LinkPhonePanel({ currentPhone }) {
  const [phone, setPhone] = useState(currentPhone || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const requestOtp = useLinkPhoneRequestOtp();
  const verifyOtp = useLinkPhoneVerify();

  useEffect(() => {
    setPhone(currentPhone || '');
  }, [currentPhone]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = window.setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const sendCode = async () => {
    setErrorMsg('');
    if (!isPlausibleSriLankaPhone(phone)) {
      setErrorMsg('Enter a valid Sri Lankan mobile number');
      return;
    }
    try {
      await requestOtp.mutateAsync({ phone: phone.trim() });
      setStep('otp');
      setCooldown(RESEND_SECONDS);
      setOtp('');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Unable to send verification code');
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrorMsg('Enter the 6-digit verification code');
      return;
    }
    try {
      await verifyOtp.mutateAsync({ phone: phone.trim(), otp: otp.trim() });
      setStep('phone');
      setOtp('');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Could not link phone number');
    }
  };

  const pending = requestOtp.isPending || verifyOtp.isPending;

  return (
    <div className="mt-6 max-w-xl rounded-2xl border border-line bg-canvas/60 p-4 sm:p-5">
      <p className="eyebrow">Phone verification</p>
      <h3 className="customer-card-title mt-2">
        {currentPhone ? 'Update linked phone' : 'Link a phone number'}
      </h3>
      <p className="customer-body mt-2">
        {currentPhone
          ? `Current number: ${currentPhone}. Verify a new number with SMS to update it.`
          : 'Add a mobile number so you can sign in with OTP next time.'}
      </p>

      {step === 'otp' ? (
        <form onSubmit={handleVerify} className="mt-4 space-y-4">
          <p className="text-sm text-muted">
            Code sent to <strong>{phone.trim()}</strong>.{' '}
            <button
              type="button"
              className="underline font-semibold text-ink"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setErrorMsg('');
              }}
            >
              Change number
            </button>
          </p>
          <label className="block text-sm font-semibold">
            Verification code
            <input
              className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-3"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </label>
          {errorMsg && <p className="text-sm text-red-700" role="alert">{errorMsg}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending || otp.length !== 6}
              className="rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {verifyOtp.isPending ? 'Verifying…' : 'Verify & link'}
            </button>
            <button
              type="button"
              disabled={pending || cooldown > 0}
              onClick={sendCode}
              className="text-sm font-semibold underline disabled:no-underline disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendCode();
          }}
          className="mt-4 space-y-4"
        >
          <label className="block text-sm font-semibold">
            Mobile number
            <input
              className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-3"
              type="tel"
              autoComplete="tel"
              placeholder="0771234567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          {errorMsg && <p className="text-sm text-red-700" role="alert">{errorMsg}</p>}
          <button
            type="submit"
            disabled={pending || !phone.trim()}
            className="rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {requestOtp.isPending ? 'Sending…' : 'Send verification code'}
          </button>
        </form>
      )}
    </div>
  );
}
