import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOwnerLogin } from '../../hooks/useOwner';
import AuthAccessShell from '../../components/auth/AuthAccessShell';

export default function OwnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useOwnerLogin();

  const handleSubmit = (event) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <AuthAccessShell
      role="owner"
      mode="login"
      kicker="BooknPlay for business"
      title="Welcome back."
      subtitle="Your courts, bookings, and players are waiting."
      alternate={{ prompt: 'New to BooknPlay?', label: 'Create an account', to: '/owner/register' }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="password">Password</label>
            <Link className="auth-link" to="/owner/forgot-password">Forgot password?</Link>
          </div>
          <div className="auth-password">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" className="auth-show" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        {loginMutation.isError && <p className="auth-error" role="alert">{loginMutation.error?.response?.data?.message || 'Login failed'}</p>}
        <button className="auth-primary" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in…' : <>Sign in <span aria-hidden="true">↗</span></>}
        </button>
      </form>
    </AuthAccessShell>
  );
}
