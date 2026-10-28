import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomerScrollManager from './CustomerScrollManager';
import CustomerMobileHeader from './CustomerMobileHeader';
import CustomerMobileDrawer from './CustomerMobileDrawer';
import CustomerBottomNav from './CustomerBottomNav';
import WhatsAppFab from '../ui/WhatsAppFab';
import PwaInstallBanner from '../pwa/PwaInstallBanner';
import { PwaInstallProvider } from '../../hooks/usePwaInstall';
import { isFocusedCustomerFlow } from './customerMobileNav';

export default function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const focused = isFocusedCustomerFlow(pathname);
  const showBottomNav = !isDesktop && !focused;

  return (
    <PwaInstallProvider>
      <div
        className={`customer-shell min-h-screen flex flex-col bg-canvas text-ink font-sans ${
          !isDesktop ? 'customer-shell--mobile' : ''
        } ${showBottomNav ? 'customer-shell--tabs' : ''} ${focused && !isDesktop ? 'customer-shell--focused' : ''}`}
      >
        <CustomerScrollManager />
        {isDesktop ? (
          <Navbar />
        ) : (
          <>
            <CustomerMobileHeader onOpenMenu={() => setDrawerOpen(true)} />
            <CustomerMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </>
        )}
        <main className={`flex-1 min-w-0 ${showBottomNav ? 'customer-main--with-tabs' : ''}`}>
          <Outlet />
        </main>
        {isDesktop && <Footer />}
        {isDesktop && <WhatsAppFab />}
        {showBottomNav && <CustomerBottomNav />}
        <PwaInstallBanner liftForTabs={showBottomNav} />
      </div>
    </PwaInstallProvider>
  );
}
