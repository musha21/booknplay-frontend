import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthAccessShell from '../../components/auth/AuthAccessShell';
import { useForgotPasswordByPhone, useResetPasswordByPhone } from '../../hooks/useAuth';
import { isPlausibleSriLankaPhone } from '../../utils/otpAuth';

const RESEND_SECONDS = 60;

export default function ForgotPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const forgotMutation = useForgotPasswordByPhone();
  const resetMutation = useResetPasswordByPhone();

  const [step, setStep] = useState('phone'); // phone | otp | done
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

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
      await forgotMutation.mutateAsync({ phone: phone.trim() });
      setStep('otp');
      setCooldown(RESEND_SECONDS);
      setOtp('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to send verification code');
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrorMsg('Enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    try {
      await resetMutation.mutateAsync({
        phone: phone.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep('done');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not reset password');
    }
  };

  const pending = forgotMutation.isPending || resetMutation.isPending;

  return (
    <AuthAccessShell
      role="customer"
      mode="login"
      kicker="Account Recovery"
      title="Reset your password"
      subtitle="Verify your mobile number with a one-time code, then choose a new password."
      alternate={{ prompt: 'Remembered your password?', label: 'Sign in', to: '/auth/login', state: location.state }}
    >
      {step === 'done' ? (
        <div className="auth-form">
          <p className="auth-note">
            Your password was updated. Sign in with your mobile number and new password.
          </p>
          <button
            type="button"
            className="auth-primary"
            onClick={() => navigate('/auth/login', { state: location.state, replace: true })}
          >
            Return to sign in <span aria-hidden="true">↗</span>
          </button>
        </div>
      ) : step === 'otp' ? (
        <form className="auth-form" onSubmit={handleReset}>
          <p className="auth-note">
            If an account exists for <strong>{phone.trim()}</strong>, a code was sent.{' '}
            <button type="button" className="auth-link" onClick={() => { setStep('phone'); setErrorMsg(''); }}>
              Change number
            </button>
          </p>
          <div className="auth-field">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="newPassword">New password</label>
            <div className="auth-password">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <button type="button" className="auth-show" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {errorMsg && <p className="auth-error" role="alert">{errorMsg}</p>}
          <button className="auth-primary" type="submit" disabled={pending}>
            {resetMutation.isPending ? 'Updating…' : <>Update password <span aria-hidden="true">↗</span></>}
          </button>
          <button
            type="button"
            className="auth-link auth-resend"
            disabled={pending || cooldown > 0}
            onClick={sendCode}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); sendCode(); }}>
          <div className="auth-field">
            <label htmlFor="phone">Mobile number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <p className="auth-note">
            We&apos;ll send a verification code if this number is linked to a BooknPlay account.
          </p>
          {errorMsg && <p className="auth-error" role="alert">{errorMsg}</p>}
          <button className="auth-primary" type="submit" disabled={pending || !phone.trim()}>
            {forgotMutation.isPending ? 'Sending…' : <>Send code <span aria-hidden="true">↗</span></>}
          </button>
          <p className="auth-note">
            <Link className="auth-link" to="/auth/login" state={location.state}>Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthAccessShell>
  );
}
