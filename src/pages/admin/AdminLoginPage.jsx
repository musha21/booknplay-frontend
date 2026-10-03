import { useState } from 'react';
import { useAdminLogin } from '../../hooks/useAdmin';
import AuthAccessShell from '../../components/auth/AuthAccessShell';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useAdminLogin();

  return (
    <AuthAccessShell
      role="admin"
      mode="login"
      kicker="Restricted access"
      title="Admin sign in."
      subtitle="Sign in with your invited administrator account."
    >
      <form className="auth-form" onSubmit={(event) => { event.preventDefault(); login.mutate({ email, password }); }}>
        <div className="auth-field">
          <label htmlFor="email">Work email</label>
          <input id="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="auth-password">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" className="auth-show" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        {login.isError && <p className="auth-error" role="alert">{login.error?.response?.data?.message || 'Login failed'}</p>}
        <button className="auth-primary" type="submit" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : <>Continue securely <span aria-hidden="true">↗</span></>}
        </button>
      </form>
    </AuthAccessShell>
  );
}
