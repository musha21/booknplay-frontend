import { Link, useNavigate } from 'react-router-dom';
import { Avatar, IconButton } from '@mui/material';
import { Menu } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';

export default function CustomerMobileHeader({ onOpenMenu }) {
  const navigate = useNavigate();
  const { customer, isAuthenticated } = useAuthStore();

  return (
    <header className="customer-mobile-header">
      <div className="customer-mobile-header__inner">
        <IconButton
          edge="start"
          aria-label="Open menu"
          onClick={onOpenMenu}
          className="!min-h-11 !min-w-11 !text-navy-900 dark:!text-ink"
        >
          <Menu size={22} />
        </IconButton>
        <BrandLogo compact to="/" className="customer-mobile-header__logo" />
        <div className="customer-mobile-header__actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <IconButton
              aria-label="Open profile"
              onClick={() => navigate('/account/profile')}
              className="!min-h-11 !min-w-11 !p-0.5"
            >
              <Avatar className="!h-8 !w-8 !bg-lime-400 !text-xs !font-black !text-navy-900">
                {customer?.firstName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          ) : (
            <Link to="/auth/login" className="customer-mobile-header__sign-in">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
