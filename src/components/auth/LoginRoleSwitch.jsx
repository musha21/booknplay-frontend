import { NavLink } from 'react-router-dom';

export default function LoginRoleSwitch() {
  return (
    <div className="mb-7 grid grid-cols-2 rounded-2xl bg-slate-100 p-1" aria-label="Choose account type">
      <NavLink
        to="/auth/login"
        className={({ isActive }) => `flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-extrabold no-underline transition ${isActive ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'}`}
      >
        Customer
      </NavLink>
      <NavLink
        to="/owner/login"
        className={({ isActive }) => `flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-extrabold no-underline transition ${isActive ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-500 hover:text-navy-900'}`}
      >
        Business owner
      </NavLink>
    </div>
  );
}
