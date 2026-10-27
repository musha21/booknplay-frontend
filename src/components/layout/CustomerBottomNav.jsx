import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Compass, Heart, Home, User } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import {
  CUSTOMER_BOTTOM_TABS,
  customerAuthRedirect,
  isCustomerTabActive,
} from './customerMobileNav';

const ICONS = {
  home: Home,
  explore: Compass,
  bookings: CalendarDays,
  favorites: Heart,
  profile: User,
};

export default function CustomerBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <nav className="customer-bottom-nav" aria-label="Primary">
      {CUSTOMER_BOTTOM_TABS.map((tab) => {
        const Icon = ICONS[tab.id] || Home;
        const active = isCustomerTabActive(tab.match, location);
        const needsAuth = tab.requiresAuth && !isAuthenticated;

        if (needsAuth) {
          return (
            <button
              key={tab.id}
              type="button"
              className={`customer-bottom-nav__tab ${active ? 'is-active' : ''}`}
              onClick={() => navigate(customerAuthRedirect(tab.to))}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={tab.id}
            to={tab.to}
            className={`customer-bottom-nav__tab ${active ? 'is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
