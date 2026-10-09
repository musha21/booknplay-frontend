import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthAccessShell from '../../components/auth/AuthAccessShell';
import { useRegisterWithPhone } from '../../hooks/useAuth';

export default function PhoneRegisterPage() {
  const location = useLocation();
  const verificationToken = location.state?.verificationToken;
  const phone = location.state?.phone || '';
  const registerMutation = useRegisterWithPhone();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!verificationToken) {
    return <Navigate to="/auth/register" replace state={location.state} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    try {
      await registerMutation.mutateAsync({
        verificationToken,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setLocalError(err?.response?.data?.message || 'Registration failed');
    }
  };

  const emailExists = registerMutation.error?.response?.data?.code === 'EMAIL_EXISTS';

  return (
    <AuthAccessShell
      role="customer"
      mode="register"
      kicker="Almost there"
      title="Finish your account."
      subtitle="Your phone is verified. Set a password so you can sign in next time."
      alternate={{ prompt: 'Already have an account?', label: 'Sign in', to: '/auth/login', state: location.state }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {phone ? (
          <p className="auth-note">
            Verified phone: <strong>{phone}</strong>
          </p>
        ) : null}
        <div className="auth-field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className="auth-field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        {(localError || registerMutation.isError) && (
          <p className="auth-error" role="alert">
            {localError || registerMutation.error?.response?.data?.message || 'Registration failed'}
          </p>
        )}
        {emailExists && (
          <p className="auth-note">
            Sign in with that email, then link this phone from{' '}
            <Link className="auth-link" to="/auth/login" state={location.state}>your account</Link>.
          </p>
        )}
        <button className="auth-primary" type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating account…' : <>Create account <span aria-hidden="true">↗</span></>}
        </button>
      </form>
    </AuthAccessShell>
  );
}
