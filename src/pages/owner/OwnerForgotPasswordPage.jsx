import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestOwnerPasswordReset } from '../../api/ownerAuth';
import AuthAccessShell from '../../components/auth/AuthAccessShell';

export default function OwnerForgotPasswordPage() {
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
      await requestOwnerPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
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
      role="owner"
      mode="login"
      kicker="Partner Recovery"
      title="Reset partner password"
      subtitle="Enter your work email to receive password reset instructions."
      alternate={{ prompt: 'Remembered your password?', label: 'Sign in', to: '/owner/login' }}
    >
      {submitted ? (
        <div className="auth-form space-y-4">
          <div className="rounded-xl bg-lime-500/10 p-4 text-sm font-semibold text-lime-800 dark:text-lime-300">
            If a business account exists for <span className="font-bold underline">{email}</span>, password reset instructions have been sent.
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check your spam folder or contact support if you need assistance.
          </p>
          <Link to="/owner/login" className="auth-primary text-center block !no-underline">
            Return to partner sign in <span aria-hidden="true">↗</span>
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Work email address</label>
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
