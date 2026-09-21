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

const Layout = lazy(() => import('./components/layout/Layout'));
const ProtectedRoute = lazy(() => import('./components/layout/ProtectedRoute'));
const OwnerProtectedRoute = lazy(() => import('./components/layout/OwnerProtectedRoute'));
const OwnerLayout = lazy(() => import('./components/layout/OwnerLayout'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const VenueDetailPage = lazy(() => import('./pages/VenueDetailPage'));
const ChooseSlotPage = lazy(() => import('./pages/ChooseSlotPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentReturnPage = lazy(() => import('./pages/PaymentReturnPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AccountPage = lazy(() => import('./pages/account/AccountPage'));
const UpcomingBookingsPage = lazy(() => import('./pages/account/UpcomingBookingsPage'));
const BookingHistoryPage = lazy(() => import('./pages/account/BookingHistoryPage'));
const FavouritesPage = lazy(() => import('./pages/account/FavouritesPage'));
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const PrivacyPage = lazy(() => import('./pages/account/PrivacyPage'));
const HelpPage = lazy(() => import('./pages/account/HelpPage'));
const OwnerLoginPage = lazy(() => import('./pages/owner/OwnerLoginPage'));
const OwnerRegisterPage = lazy(() => import('./pages/owner/OwnerRegisterPage'));
const OwnerVenuesPage = lazy(() => import('./pages/owner/OwnerVenuesPage'));
const OwnerOnboardingPage = lazy(() => import('./pages/owner/OwnerOnboardingPage'));
const OwnerCourtsPage = lazy(() => import('./pages/owner/OwnerCourtsPage'));
const OwnerCalendarPage = lazy(() => import('./pages/owner/OwnerCalendarPage'));
const OwnerEarningsPage = lazy(() => import('./pages/owner/OwnerEarningsPage'));
const OwnerProfilePage = lazy(() => import('./pages/owner/OwnerProfilePage'));

const router = createBrowserRouter([
  {
    path: '/', element: <Layout />, children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchResultsPage /> },
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
  { path: 'owner/login', element: <OwnerLoginPage /> },
  { path: 'owner/register', element: <OwnerRegisterPage /> },
  {
    path: 'owner', element: <OwnerProtectedRoute />, children: [{
      element: <OwnerLayout />, children: [
        { index: true, element: <OwnerVenuesPage /> },
        { path: 'venues/new', element: <OwnerOnboardingPage /> },
        { path: 'venues/:venueId/courts', element: <OwnerCourtsPage /> },
        { path: 'venues/:venueId/calendar', element: <OwnerCalendarPage /> },
        { path: 'earnings', element: <OwnerEarningsPage /> },
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
