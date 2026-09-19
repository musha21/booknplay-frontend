import { Link, Outlet, useLocation } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { EventNote, Favorite, HelpOutlined, History, Person, Shield } from '@mui/icons-material';
import useAuthStore from '../../stores/authStore';

const items = [
  ['Upcoming', '/account/bookings', EventNote], ['History', '/account/history', History],
  ['Favourites', '/account/favourites', Favorite], ['Profile', '/account/profile', Person],
  ['Privacy', '/account/privacy', Shield], ['Help', '/account/help', HelpOutlined],
];

export default function AccountPage() {
  const { pathname } = useLocation();
  const customer = useAuthStore((state) => state.customer);
  return (
    <main className="page-shell py-8 sm:py-12"><div className="section-container">
      <div className="mb-7 flex items-center gap-4"><Avatar className="!h-14 !w-14 !bg-lime-400 !font-black !text-navy-900">{customer?.firstName?.[0] || 'U'}</Avatar><div><p className="eyebrow">Player account</p><h1 className="text-2xl font-black text-ink">{customer?.firstName || 'Player'} {customer?.lastName || ''}</h1><p className="text-sm text-muted">{customer?.email}</p></div></div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Account navigation" className="surface-card overflow-x-auto p-2 lg:h-fit"><div className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">{items.map(([label,to,Icon]) => { const active = pathname === to || (to.endsWith('/bookings') && pathname === '/account'); return <Link key={to} to={to} aria-current={active ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-bold no-underline transition ${active ? 'bg-lime-300 text-navy-900' : 'text-muted hover:bg-canvas hover:text-ink'}`}><Icon fontSize="small" />{label}</Link>; })}</div></nav>
        <section className="min-w-0"><Outlet /></section>
      </div>
    </div></main>
  );
}
