import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Divider, Drawer, IconButton } from '@mui/material';
import {
  CalendarDays,
  Compass,
  Heart,
  HelpCircle,
  History,
  Home,
  LogIn,
  LogOut,
  Shield,
  Trophy,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { revokeAndClearSession } from '../../lib/signOut';
import useAuthStore from '../../stores/authStore';
import BrandLogo from '../ui/BrandLogo';
import {
  CUSTOMER_DRAWER_GROUPS,
  customerAuthRedirect,
  isDrawerLinkActive,
} from './customerMobileNav';

const ICONS = {
  home: Home,
  compass: Compass,
  trophy: Trophy,
  calendar: CalendarDays,
  user: User,
  heart: Heart,
  history: History,
  help: HelpCircle,
  shield: Shield,
};

export default function CustomerMobileDrawer({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, isAuthenticated } = useAuthStore();

  const go = (to, requiresAuth) => {
    onClose();
    if (requiresAuth && !isAuthenticated) {
      navigate(customerAuthRedirect(to));
      return;
    }
    navigate(to);
  };

  const handleLogout = async () => {
    onClose();
    const path = await revokeAndClearSession('CUSTOMER');
    navigate(path);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          className: 'customer-mobile-drawer',
          sx: {
            width: 'min(88vw, 320px)',
            maxWidth: 'calc(100vw - 24px)',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      <div className="customer-mobile-drawer__top">
        <div onClick={onClose}>
          <BrandLogo compact to="/" />
        </div>
        <IconButton aria-label="Close menu" onClick={onClose} className="!min-h-11 !min-w-11">
          <X size={20} />
        </IconButton>
      </div>

      <div className="customer-mobile-drawer__identity">
        <Avatar className="!h-12 !w-12 !bg-lime-400 !font-black !text-navy-900">
          {isAuthenticated ? (customer?.firstName?.[0]?.toUpperCase() || 'U') : <User size={22} />}
        </Avatar>
        <div className="min-w-0">
          {isAuthenticated ? (
            <>
              <p className="truncate text-sm font-extrabold text-ink">
                {customer?.firstName || 'Player'} {customer?.lastName || ''}
              </p>
              <p className="truncate text-xs text-muted">{customer?.email}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-extrabold text-ink">Guest</p>
              <p className="text-xs text-muted">Sign in to manage bookings</p>
            </>
          )}
        </div>
      </div>

      <nav className="customer-mobile-drawer__nav" aria-label="Customer menu">
        {CUSTOMER_DRAWER_GROUPS.map((group) => (
          <div key={group.id} className="customer-mobile-drawer__group">
            <p className="customer-mobile-drawer__group-label">{group.label}</p>
            <ul>
              {group.items.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                const Icon = ICONS[item.icon] || Home;
                const active = isDrawerLinkActive(item.to, location);
                return (
                  <li key={item.to}>
                    <button
                      type="button"
                      className={`customer-mobile-drawer__link ${active ? 'is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => go(item.to, item.requiresAuth)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Divider />

      <div className="customer-mobile-drawer__auth">
        {isAuthenticated ? (
          <button type="button" className="customer-mobile-drawer__link is-danger" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        ) : (
          <>
            <Link to="/auth/login" className="customer-mobile-drawer__link" onClick={onClose}>
              <LogIn size={18} aria-hidden="true" />
              <span>Log in</span>
            </Link>
            <Link to="/auth/register" className="customer-mobile-drawer__link" onClick={onClose}>
              <UserPlus size={18} aria-hidden="true" />
              <span>Create account</span>
            </Link>
          </>
        )}
      </div>
    </Drawer>
  );
}
