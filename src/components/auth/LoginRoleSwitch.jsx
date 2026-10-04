import { NavLink, useLocation } from 'react-router-dom';

export default function LoginRoleSwitch({ mode = 'login' }) {
  const location = useLocation();
  const playerTo = mode === 'register' ? '/auth/register' : '/auth/login';
  const ownerTo = mode === 'register' ? '/owner/register' : '/owner/login';
  return (
    <nav className="auth-roles" aria-label="Choose portal">
      <NavLink to={playerTo} state={location.state} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Player</NavLink>
      <NavLink to={ownerTo} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>Business owner</NavLink>
    </nav>
  );
}
