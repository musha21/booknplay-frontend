import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AccountBalance,
  Business,
  CardMembership,
  Dashboard,
  EventNote,
  Home,
  Logout,
  Menu as MenuIcon,
  People,
  Stadium,
} from '@mui/icons-material';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';
import { revokeAndClearSession } from '../../lib/signOut';

const links = [
  [Dashboard, 'Overview', '/admin'],
  [Home, 'Homepage', '/admin/homepage'],
  [Business, 'Businesses', '/admin/businesses'],
  [AccountBalance, 'Payouts', '/admin/payouts'],
  [CardMembership, 'Plans', '/admin/plans'],
  [Stadium, 'Venues', '/admin/venues'],
  [People, 'Customers', '/admin/customers'],
  [EventNote, 'Audit log', '/admin/audit'],
];

function AdminNav({ onNavigate }) {
  const navigate = useNavigate();

  return (
    <>
      <div onClick={onNavigate}>
        <BrandLogo inverse to="/admin" />
      </div>
      <p className="mt-7 text-xs font-extrabold uppercase tracking-widest text-lime-300">Super admin</p>
      <nav className="mt-5 flex flex-col gap-2">
        {links.map(([Icon, label, to]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 text-sm font-bold ${
                isActive ? 'bg-lime-400 text-navy-900' : 'text-slate-300 hover:bg-white/10'
              }`
            }
          >
            <Icon fontSize="small" />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={async () => {
          onNavigate?.();
          const path = await revokeAndClearSession('SUPER_ADMIN');
          navigate(path);
        }}
        className="mt-6 flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-bold text-red-300 hover:bg-white/10"
      >
        <Logout fontSize="small" />
        Sign out
      </button>
    </>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const closeNav = () => setOpen(false);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden bg-navy-900 p-5 text-white lg:block lg:min-h-screen">
        <AdminNav />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-navy-900/50"
            onClick={closeNav}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[min(88vw,320px)] max-w-[calc(100vw-24px)] flex-col overflow-y-auto bg-navy-900 p-5 text-white shadow-[16px_0_48px_rgba(6,16,50,0.2)]"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
          >
            <AdminNav onNavigate={closeNav} />
          </aside>
        </div>
      )}

      <main className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-line bg-surface px-3 sm:px-5">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-navy-900 hover:bg-canvas lg:hidden"
            aria-label="Open admin navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
          <strong className="min-w-0 flex-1 truncate">Platform control centre</strong>
          <ThemeToggle />
        </header>
        <div className="p-4 sm:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
