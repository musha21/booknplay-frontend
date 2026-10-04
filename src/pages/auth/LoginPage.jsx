import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import AuthAccessShell from '../../components/auth/AuthAccessShell';

export default function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const bookingRedirect = location.state?.reason === 'booking' || location.state?.from?.pathname === '/checkout';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <AuthAccessShell
      role="customer"
      mode="login"
      kicker="Let’s play"
      title={bookingRedirect ? 'Sign in to complete your booking' : 'Welcome back.'}
      subtitle={bookingRedirect
        ? 'You can browse bookable spaces without an account. A customer login is required to reserve a slot.'
        : 'Your next great game is one sign-in away.'}
      alternate={{ prompt: 'New to BooknPlay?', label: 'Create an account', to: '/auth/register', state: location.state }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="password">Password</label>
            <Link className="auth-link" to="/auth/forgot-password" state={location.state}>Forgot password?</Link>
          </div>
          <div className="auth-password">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" className="auth-show" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        {loginMutation.isError && <p className="auth-error" role="alert">{loginMutation.error?.response?.data?.message || 'Invalid email or password'}</p>}
        <button className="auth-primary" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in…' : <>Sign in <span aria-hidden="true">↗</span></>}
        </button>
      </form>
    </AuthAccessShell>
  );
}
