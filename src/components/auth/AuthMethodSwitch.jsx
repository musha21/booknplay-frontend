/**
 * Email | Phone method toggle for customer login.
 */
export default function AuthMethodSwitch({ method, onChange }) {
  return (
    <div className="auth-method-switch" role="tablist" aria-label="Sign-in method">
      <button
        type="button"
        role="tab"
        aria-selected={method === 'email'}
        className={method === 'email' ? 'is-active' : undefined}
        onClick={() => onChange('email')}
      >
        Email
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={method === 'phone'}
        className={method === 'phone' ? 'is-active' : undefined}
        onClick={() => onChange('phone')}
      >
        Phone
      </button>
    </div>
  );
}
