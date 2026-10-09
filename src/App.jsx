import { lazy, Suspense, useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toaster } from 'sonner';
import queryClient from './lib/queryClient';
import { createAppTheme } from './theme/muiTheme';
import { useThemeMode } from './theme/ThemeModeContext';
import RouteLoader from './components/ui/RouteLoader';
import { AdminAuditPage, AdminBusinessesPage, AdminCustomersPage, AdminVenuesPage } from './pages/admin/AdminResourcePages';

const Layout = lazy(() => import('./components/layout/Layout'));
const ProtectedRoute = lazy(() => import('./components/layout/ProtectedRoute'));
const OwnerProtectedRoute = lazy(() => import('./components/layout/OwnerProtectedRoute'));
const OwnerLayout = lazy(() => import('./components/layout/OwnerLayout'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const VenueDetailPage = lazy(() => import('./pages/VenueDetailPage'));
const ChooseSlotPage = lazy(() => import('./pages/ChooseSlotPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentReturnPage = lazy(() => import('./pages/PaymentReturnPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PhoneRegisterPage = lazy(() => import('./pages/auth/PhoneRegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const AccountPage = lazy(() => import('./pages/account/AccountPage'));
const UpcomingBookingsPage = lazy(() => import('./pages/account/UpcomingBookingsPage'));
const BookingHistoryPage = lazy(() => import('./pages/account/BookingHistoryPage'));
const FavouritesPage = lazy(() => import('./pages/account/FavouritesPage'));
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const PrivacyPage = lazy(() => import('./pages/account/PrivacyPage'));
const HelpPage = lazy(() => import('./pages/account/HelpPage'));
const OwnerLoginPage = lazy(() => import('./pages/owner/OwnerLoginPage'));
const OwnerRegisterPage = lazy(() => import('./pages/owner/OwnerRegisterPage'));
const OwnerForgotPasswordPage = lazy(() => import('./pages/owner/OwnerForgotPasswordPage'));
const OwnerDashboardPage = lazy(() => import('./pages/owner/OwnerDashboardPage'));
const OwnerVenuesPage = lazy(() => import('./pages/owner/OwnerVenuesPage'));
const OwnerOnboardingPage = lazy(() => import('./pages/owner/OwnerOnboardingPage'));
const OwnerCourtsPage = lazy(() => import('./pages/owner/OwnerCourtsPage'));
const OwnerCourtsHubPage = lazy(() => import('./pages/owner/OwnerCourtsHubPage'));
const OwnerCalendarPage = lazy(() => import('./pages/owner/OwnerCalendarPage'));
const OwnerCalendarHubPage = lazy(() => import('./pages/owner/OwnerCalendarHubPage'));
const OwnerBookingPolicyPage = lazy(() => import('./pages/owner/OwnerBookingPolicyPage'));
const OwnerVenueEditPage = lazy(() => import('./pages/owner/OwnerVenueEditPage'));
const OwnerBookingsPage = lazy(() => import('./pages/owner/OwnerBookingsPage'));
const OwnerSportsPage = lazy(() => import('./pages/owner/OwnerSportsPage'));
const OwnerWalkInPage = lazy(() => import('./pages/owner/OwnerWalkInPage'));
const OwnerAvailabilityPage = lazy(() => import('./pages/owner/OwnerAvailabilityPage'));
const OwnerBlockedSlotsPage = lazy(() => import('./pages/owner/OwnerBlockedSlotsPage'));
const OwnerMaintenancePage = lazy(() => import('./pages/owner/OwnerMaintenancePage'));
const OwnerPricingPage = lazy(() => import('./pages/owner/OwnerPricingPage'));
const OwnerPromotionsPage = lazy(() => import('./pages/owner/OwnerPromotionsPage'));
const OwnerCustomersPage = lazy(() => import('./pages/owner/OwnerCustomersPage'));
const OwnerPaymentsPage = lazy(() => import('./pages/owner/OwnerPaymentsPage'));
const OwnerRefundsPage = lazy(() => import('./pages/owner/OwnerRefundsPage'));
const OwnerEarningsPage = lazy(() => import('./pages/owner/OwnerEarningsPage'));
const OwnerReportsPage = lazy(() => import('./pages/owner/OwnerReportsPage'));
const OwnerTeamPage = lazy(() => import('./pages/owner/OwnerTeamPage'));
const OwnerSettingsPage = lazy(() => import('./pages/owner/OwnerSettingsPage'));
const OwnerReviewsPage = lazy(() => import('./pages/owner/OwnerReviewsPage'));
const OwnerBillingPage = lazy(() => import('./pages/owner/OwnerBillingPage'));
const OwnerBillingReturnPage = lazy(() => import('./pages/owner/OwnerBillingReturnPage'));
const OwnerProfilePage = lazy(() => import('./pages/owner/OwnerProfilePage'));
const AdminProtectedRoute = lazy(() => import('./components/layout/AdminProtectedRoute'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminHomepagePage = lazy(() => import('./pages/admin/AdminHomepagePage'));
const AdminPlansPage = lazy(() => import('./pages/admin/AdminPlansPage'));

const router = createBrowserRouter([
  {
    path: '/', element: <Layout />, children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'venues/:venueId', element: <VenueDetailPage /> },
      { path: 'venues/:venueId/slots', element: <ChooseSlotPage /> },
      {
        element: <ProtectedRoute />, children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'checkout/:bookingId', element: <CheckoutPage /> },
          { path: 'payment/return', element: <PaymentReturnPage /> },
          { path: 'bookings/:bookingId', element: <BookingDetailPage /> },
          {
            path: 'account', element: <AccountPage />, children: [
              { index: true, element: <UpcomingBookingsPage /> },
              { path: 'bookings', element: <UpcomingBookingsPage /> },
              { path: 'history', element: <BookingHistoryPage /> },
              { path: 'favourites', element: <FavouritesPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'privacy', element: <PrivacyPage /> },
              { path: 'help', element: <HelpPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: 'auth/login', element: <LoginPage /> },
  { path: 'auth/register', element: <RegisterPage /> },
  { path: 'auth/phone-register', element: <PhoneRegisterPage /> },
  { path: 'auth/forgot-password', element: <ForgotPasswordPage /> },
  { path: 'owner/login', element: <OwnerLoginPage /> },
  { path: 'owner/register', element: <OwnerRegisterPage /> },
  { path: 'owner/forgot-password', element: <OwnerForgotPasswordPage /> },
  { path: 'admin/login', element: <AdminLoginPage /> },
  {
    path: 'admin', element: <AdminProtectedRoute />, children: [{
      element: <AdminLayout />, children: [
        { index: true, element: <AdminDashboardPage /> },
        { path: 'homepage', element: <AdminHomepagePage /> },
        { path: 'businesses', element: <AdminBusinessesPage /> },
        { path: 'plans', element: <AdminPlansPage /> },
        { path: 'venues', element: <AdminVenuesPage /> },
        { path: 'customers', element: <AdminCustomersPage /> },
        { path: 'audit', element: <AdminAuditPage /> },
      ],
    }],
  },
  {
    path: 'owner', element: <OwnerProtectedRoute />, children: [{
      element: <OwnerLayout />, children: [
        { index: true, element: <OwnerDashboardPage /> },
        { path: 'venues', element: <OwnerVenuesPage /> },
        { path: 'venues/new', element: <OwnerOnboardingPage /> },
        { path: 'venues/:venueId/edit', element: <OwnerVenueEditPage /> },
        { path: 'venues/:venueId/courts', element: <OwnerCourtsPage /> },
        { path: 'venues/:venueId/calendar', element: <OwnerCalendarPage /> },
        { path: 'venues/:venueId/booking-policy', element: <OwnerBookingPolicyPage /> },
        { path: 'courts', element: <OwnerCourtsHubPage /> },
        { path: 'sports', element: <OwnerSportsPage /> },
        { path: 'bookings', element: <OwnerBookingsPage /> },
        { path: 'calendar', element: <OwnerCalendarHubPage /> },
        { path: 'walk-in', element: <OwnerWalkInPage /> },
        { path: 'availability', element: <OwnerAvailabilityPage /> },
        { path: 'blocked-slots', element: <OwnerBlockedSlotsPage /> },
        { path: 'maintenance', element: <OwnerMaintenancePage /> },
        { path: 'pricing', element: <OwnerPricingPage /> },
        { path: 'promotions', element: <OwnerPromotionsPage /> },
        { path: 'customers', element: <OwnerCustomersPage /> },
        { path: 'payments', element: <OwnerPaymentsPage /> },
        { path: 'refunds', element: <OwnerRefundsPage /> },
        { path: 'earnings', element: <OwnerEarningsPage /> },
        { path: 'reports/*', element: <OwnerReportsPage /> },
        { path: 'team', element: <OwnerTeamPage /> },
        { path: 'settings', element: <OwnerSettingsPage /> },
        { path: 'reviews', element: <OwnerReviewsPage /> },
        { path: 'billing', element: <OwnerBillingPage /> },
        { path: 'billing/return', element: <OwnerBillingReturnPage /> },
        { path: 'profile', element: <OwnerProfilePage /> },
      ],
    }],
  },
]);

export default function App() {
  const { resolvedMode } = useThemeMode();
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <Suspense fallback={<RouteLoader />}><RouterProvider router={router} /></Suspense>
          <Toaster position="top-right" richColors theme={resolvedMode} />
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
