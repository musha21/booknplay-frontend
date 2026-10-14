import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AuthAccessShell from '../../components/auth/AuthAccessShell';
import { useRegister, useRequestOtp, useVerifyOtp } from '../../hooks/useAuth';
import { isPlausibleSriLankaPhone, unwrapAuthPayload } from '../../utils/otpAuth';

const RESEND_SECONDS = 60;

export default function RegisterPage() {
  const registerMutation = useRegister();
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const isRegistering = registerMutation.isPending;
  const location = useLocation();
  const bookingRedirect = location.state?.reason === 'booking' || location.state?.from?.pathname === '/checkout';

  const [step, setStep] = useState('phone'); // phone | otp | details
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = window.setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const sendCode = async () => {
    setError(null);
    if (!isPlausibleSriLankaPhone(phone)) {
      setError('Enter a valid Sri Lankan mobile number');
      return;
    }
    try {
      await requestOtp.mutateAsync({ phone: phone.trim() });
      setStep('otp');
      setCooldown(RESEND_SECONDS);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send verification code');
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit verification code');
      return;
    }
    try {
      const res = await verifyOtp.mutateAsync({ phone: phone.trim(), otp: otp.trim() });
      const payload = unwrapAuthPayload(res);
      if (!payload?.verificationToken) {
        setError('Verification failed. Please try again.');
        return;
      }
      setVerificationToken(payload.verificationToken);
      setStep('details');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError(null);
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await registerMutation.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: phone.trim(),
        password: formData.password,
        verificationToken,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    }
  };

  const pending = requestOtp.isPending || verifyOtp.isPending || isRegistering;

  return (
    <AuthAccessShell
      role="customer"
      mode="register"
      kicker="Let’s play"
      title={bookingRedirect ? 'Create an account to book' : 'Join the game.'}
      subtitle={bookingRedirect
        ? 'Verify your phone once, then set a password to confirm your booking.'
        : 'Verify your mobile number once, then sign in with phone and password.'}
      alternate={{ prompt: 'Already part of the game?', label: 'Sign in', to: '/auth/login', state: location.state }}
    >
      {step === 'phone' && (
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
          <p className="auth-note">We&apos;ll text a one-time code to verify your number.</p>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-primary" type="submit" disabled={pending || !phone.trim()}>
            {requestOtp.isPending ? 'Sending code…' : <>Send code <span aria-hidden="true">↗</span></>}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form className="auth-form" onSubmit={handleVerifyOtp}>
          <p className="auth-note">
            Code sent to <strong>{phone.trim()}</strong>.{' '}
            <button type="button" className="auth-link" onClick={() => { setStep('phone'); setError(null); }}>
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
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-primary" type="submit" disabled={pending || otp.length !== 6}>
            {verifyOtp.isPending ? 'Verifying…' : <>Verify phone <span aria-hidden="true">↗</span></>}
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
      )}

      {step === 'details' && (
        <form className="auth-form" onSubmit={handleRegister}>
          <p className="auth-note">
            Phone verified: <strong>{phone.trim()}</strong>
          </p>
          <div className="auth-field">
            <label htmlFor="firstName">First name</label>
            <input id="firstName" name="firstName" autoComplete="given-name" value={formData.firstName} onChange={handleChange} required maxLength={100} />
          </div>
          <div className="auth-field">
            <label htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" autoComplete="family-name" value={formData.lastName} onChange={handleChange} required maxLength={100} />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
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
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-primary" type="submit" disabled={pending}>
            {isRegistering ? 'Creating account…' : <>Create account <span aria-hidden="true">↗</span></>}
          </button>
        </form>
      )}
    </AuthAccessShell>
  );
}
