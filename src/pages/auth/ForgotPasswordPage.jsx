import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { requestPasswordReset } from '../../api/auth';
import AuthAccessShell from '../../components/auth/AuthAccessShell';

export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) return;

    setIsPending(true);
    setErrorMsg('');
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      // Even if API returns 404/500, avoid exposing user existence for security or handle gracefully
      if (err.response?.status === 404) {
        setSubmitted(true);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to submit reset request. Please try again.');
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthAccessShell
      role="customer"
      mode="login"
      kicker="Account Recovery"
      title="Reset your password"
      subtitle="Enter the email address associated with your customer account."
      alternate={{ prompt: 'Remembered your password?', label: 'Sign in', to: '/auth/login', state: location.state }}
    >
      {submitted ? (
        <div className="auth-form space-y-4">
          <div className="rounded-xl bg-lime-500/10 p-4 text-sm font-semibold text-lime-800 dark:text-lime-300">
            If an account exists for <span className="font-bold underline">{email}</span>, a password reset link has been sent to your inbox.
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please check your spam folder if you do not receive an email within a few minutes.
          </p>
          <Link to="/auth/login" state={location.state} className="auth-primary text-center block !no-underline">
            Return to sign in <span aria-hidden="true">↗</span>
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {errorMsg && <p className="auth-error" role="alert">{errorMsg}</p>}
          <button className="auth-primary" type="submit" disabled={isPending}>
            {isPending ? 'Sending link…' : <>Send reset link <span aria-hidden="true">↗</span></>}
          </button>
        </form>
      )}
    </AuthAccessShell>
  );
}
