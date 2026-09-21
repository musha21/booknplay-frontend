import { Link } from 'react-router-dom';
import { Email, LocationOn, Phone } from '@mui/icons-material';
import BrandLogo from '../ui/BrandLogo';

const groups = [
  { title: 'Explore', items: [['Venues in Sri Lanka', '/search'], ['Available today', '/search'], ['My bookings', '/account/bookings']] },
  { title: 'Partners', items: [['List your venue', '/owner/register'], ['Partner login', '/owner/login'], ['Owner dashboard', '/owner']] },
  { title: 'Support', items: [['Help centre', '/account/help'], ['Privacy controls', '/account/privacy'], ['Contact us', 'mailto:support@booknplay.lk']] },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="section-container grid gap-10 py-14 md:grid-cols-[1.5fr_2fr]">
        <div><BrandLogo inverse /><p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Discover and book sports courts across Sri Lanka with clear availability and instant confirmation.</p><div className="mt-5 space-y-2 text-sm text-slate-400"><p className="flex items-center gap-2"><Phone fontSize="small" /> +94 11 234 5678</p><p className="flex items-center gap-2"><Email fontSize="small" /> support@booknplay.lk</p><p className="flex items-center gap-2"><LocationOn fontSize="small" /> Colombo, Sri Lanka</p></div></div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => <div key={group.title}><h2 className="text-sm font-extrabold text-white">{group.title}</h2><ul className="mt-4 list-none space-y-3 p-0 text-sm text-slate-400">{group.items.map(([label, to]) => <li key={label}><Link className="no-underline transition hover:text-lime-300" to={to}>{label}</Link></li>)}</ul></div>)}
        </div>
      </div>
      <div className="border-t border-white/10"><div className="section-container flex flex-col justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row"><span>© 2026 Booknplay.lk</span><span>Play more. Plan less.</span></div></div>
    </footer>
  );
}
