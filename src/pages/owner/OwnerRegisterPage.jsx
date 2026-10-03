import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOwnerRegister } from '../../hooks/useOwner';
import { uploadBusinessImages } from '../../api/ownerBusiness';
import AuthAccessShell from '../../components/auth/AuthAccessShell';

function ImageTile({ label, preview, onPick }) {
  return (
    <label className="auth-upload">
      {preview ? <img src={preview} alt={label} /> : label}
      <input type="file" accept="image/*" onChange={(event) => onPick(event.target.files?.[0])} />
    </label>
  );
}

export default function OwnerRegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useOwnerRegister();
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    contactPhone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [logo, setLogo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await registerMutation.mutateAsync({
        businessName: form.businessName,
        ownerName: form.ownerName,
        email: form.email,
        contactEmail: form.email,
        contactPhone: form.contactPhone,
        address: form.address,
        password: form.password,
      });
      if (logo) {
        await uploadBusinessImages({ logo });
      }
      navigate('/owner/venues/new');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthAccessShell
      role="owner"
      mode="register"
      kicker="BooknPlay for business"
      title="Let’s grow your venue."
      subtitle="Create your owner account. Set up your venue next."
      alternate={{ prompt: 'Already part of the game?', label: 'Sign in', to: '/owner/login' }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="businessName">Business name</label>
          <input id="businessName" value={form.businessName} onChange={set('businessName')} required />
        </div>
        <div className="auth-field">
          <label htmlFor="ownerName">Owner name</label>
          <input id="ownerName" autoComplete="name" value={form.ownerName} onChange={set('ownerName')} required />
        </div>
        <div className="auth-field">
          <label htmlFor="email">Work email</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </div>
        <div className="auth-field">
          <label htmlFor="contactPhone">Phone</label>
          <input id="contactPhone" type="tel" autoComplete="tel" placeholder="+94771234567" value={form.contactPhone} onChange={set('contactPhone')} required />
          <p className="auth-note">Include the country code, for example +9477.</p>
        </div>
        <div className="auth-field">
          <label htmlFor="address">Address</label>
          <textarea id="address" value={form.address} onChange={set('address')} required />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="auth-password">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={set('password')} required />
            <button type="button" className="auth-show" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
        </div>
        <div className="auth-field">
          <label>Business logo</label>
          <p className="auth-note">Optional. You can add venue photos when you create a venue.</p>
          <div className="auth-uploads">
            <ImageTile label="Business logo" preview={logo ? URL.createObjectURL(logo) : ''} onPick={setLogo} />
          </div>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-note">Next: business details, your first venue, sports and courts.</p>
        <button className="auth-primary" type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Registering…' : <>Create account <span aria-hidden="true">↗</span></>}
        </button>
      </form>
    </AuthAccessShell>
  );
}
