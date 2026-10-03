import { Link, useLocation } from 'react-router-dom';
import { Email, LocationOn, Phone } from '@mui/icons-material';
import BrandLogo from '../ui/BrandLogo';

const groups = [
  { title: 'Explore', items: [['Venues in Kandy', '/#venues'], ['Available today', '/#venues'], ['My bookings', '/account/bookings']] },
  { title: 'Partners', items: [['List your venue', '/owner/register'], ['Partner login', '/owner/login'], ['Owner dashboard', '/owner']] },
  { title: 'Support', items: [['Help centre', '/account/help'], ['Privacy controls', '/account/privacy'], ['Contact us', 'mailto:support@booknplay.lk']] },
];

export default function Footer() {
  const isHome = useLocation().pathname === '/';

  if (isHome) {
    return (
      <footer className="home-footer">
        <div className="hp-footer-top">
          <div>
            <BrandLogo variant="home" />
            <p>Find your place to play. Book courts and venues across Sri Lanka without the back-and-forth.</p>
          </div>
          <div className="hp-footer-links">
            {groups.map((group) => (
              <div key={group.title}>
                <b>{group.title}</b>
                {group.items.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}
              </div>
            ))}
          </div>
        </div>
        <div className="hp-footer-bottom">
          <span>© 2026 Booknplay.lk</span>
          <div>
            <Link to="/account/privacy">Privacy</Link>
            <span>Play more. Plan less.</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="section-container grid gap-10 py-12 md:grid-cols-[1.35fr_2fr]">
        <div><BrandLogo /><p className="mt-4 max-w-sm text-sm leading-6 text-muted">Find your place to play. Book courts and venues across Sri Lanka without the back-and-forth.</p><div className="mt-5 space-y-2 text-sm text-muted"><p className="flex items-center gap-2"><Phone fontSize="small" /> +94 11 234 5678</p><p className="flex items-center gap-2"><Email fontSize="small" /> support@booknplay.lk</p><p className="flex items-center gap-2"><LocationOn fontSize="small" /> Kandy, Sri Lanka</p></div></div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => <div key={group.title}><h2 className="text-sm font-extrabold text-ink">{group.title}</h2><ul className="mt-4 list-none space-y-3 p-0 text-sm text-muted">{group.items.map(([label, to]) => <li key={label}><Link className="no-underline transition hover:text-lime-600" to={to}>{label}</Link></li>)}</ul></div>)}
        </div>
      </div>
      <div className="border-t border-line"><div className="section-container flex flex-col justify-between gap-3 py-5 text-xs text-muted sm:flex-row"><span>© 2026 Booknplay.lk</span><span>Play more. Plan less.</span></div></div>
    </footer>
  );
}
