import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Business, Dashboard, EventNote, Home, Logout, People, Stadium } from '@mui/icons-material';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';
import useAuthStore from '../../stores/authStore';

const links = [[Dashboard, 'Overview', '/admin'], [Home, 'Homepage', '/admin/homepage'], [Business, 'Businesses', '/admin/businesses'], [Stadium, 'Venues', '/admin/venues'], [People, 'Customers', '/admin/customers'], [EventNote, 'Audit log', '/admin/audit']];
export default function AdminLayout() {
  const navigate = useNavigate(); const logout = useAuthStore((state) => state.logout);
  return <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[250px_1fr]"><aside className="border-b border-line bg-navy-900 p-5 text-white lg:min-h-screen lg:border-b-0"><BrandLogo inverse to="/admin" /><p className="mt-7 text-xs font-extrabold uppercase tracking-widest text-lime-300">Super admin</p><nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col">{links.map(([Icon, label, to]) => <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 text-sm font-bold ${isActive ? 'bg-lime-400 text-navy-900' : 'text-slate-300 hover:bg-white/10'}`}><Icon fontSize="small" />{label}</NavLink>)}</nav><button onClick={() => { logout(); navigate('/admin/login'); }} className="mt-6 flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-bold text-red-300 hover:bg-white/10"><Logout fontSize="small" />Sign out</button></aside><main className="min-w-0"><header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5"><strong>Platform control centre</strong><ThemeToggle /></header><div className="p-4 sm:p-7"><Outlet /></div></main></div>;
}
