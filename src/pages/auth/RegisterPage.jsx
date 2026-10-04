import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthAccessShell from '../../components/auth/AuthAccessShell';

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const location = useLocation();
  const bookingRedirect = location.state?.reason === 'booking' || location.state?.from?.pathname === '/checkout';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const phoneClean = formData.phone.trim();
    if (!/^\+?[0-9]{9,15}$/.test(phoneClean)) {
      setError('Please enter a valid phone number (9-15 digits, e.g. +94771234567 or 0771234567)');
      return;
    }
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: phoneClean,
        password: formData.password,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check your details and try again.');
    }
  };

  return (
    <AuthAccessShell
      role="customer"
      mode="register"
      kicker="Let’s play"
      title={bookingRedirect ? 'Create an account to book' : 'Join the game.'}
      subtitle={bookingRedirect
        ? 'Your selected slot is saved. Create a customer account to confirm it.'
        : 'A little less planning. A lot more playing.'}
      alternate={{ prompt: 'Already part of the game?', label: 'Sign in', to: '/auth/login', state: location.state }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" autoComplete="given-name" placeholder="First name" value={formData.firstName} onChange={handleChange} required maxLength={100} />
        </div>
        <div className="auth-field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" autoComplete="family-name" placeholder="Last name" value={formData.lastName} onChange={handleChange} required maxLength={100} />
        </div>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+94771234567" value={formData.phone} onChange={handleChange} required />
          <p className="auth-note">Used for booking SMS confirmations.</p>
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="auth-password">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={formData.password} onChange={handleChange} required />
            <button type="button" className="auth-show" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
          <p className="auth-note">Use at least 6 characters.</p>
        </div>
        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} required />
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-primary" type="submit" disabled={isRegistering}>
          {isRegistering ? 'Creating account…' : <>Create account <span aria-hidden="true">↗</span></>}
        </button>
      </form>
    </AuthAccessShell>
  );
}
