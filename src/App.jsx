import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toaster } from 'sonner';

import queryClient from './lib/queryClient';
import theme from './theme/muiTheme';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import VenueDetailPage from './pages/VenueDetailPage';
import ChooseSlotPage from './pages/ChooseSlotPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentReturnPage from './pages/PaymentReturnPage';
import BookingDetailPage from './pages/BookingDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AccountPage from './pages/account/AccountPage';
import UpcomingBookingsPage from './pages/account/UpcomingBookingsPage';
import BookingHistoryPage from './pages/account/BookingHistoryPage';
import FavouritesPage from './pages/account/FavouritesPage';
import ProfilePage from './pages/account/ProfilePage';
import PrivacyPage from './pages/account/PrivacyPage';
import HelpPage from './pages/account/HelpPage';
import OwnerProtectedRoute from './components/layout/OwnerProtectedRoute';
import OwnerLayout from './components/layout/OwnerLayout';
import OwnerLoginPage from './pages/owner/OwnerLoginPage';
import OwnerRegisterPage from './pages/owner/OwnerRegisterPage';
import OwnerVenuesPage from './pages/owner/OwnerVenuesPage';
import OwnerOnboardingPage from './pages/owner/OwnerOnboardingPage';
import OwnerCourtsPage from './pages/owner/OwnerCourtsPage';
import OwnerCalendarPage from './pages/owner/OwnerCalendarPage';
import OwnerEarningsPage from './pages/owner/OwnerEarningsPage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';
 
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'venues/:venueId', element: <VenueDetailPage /> },
      { path: 'venues/:venueId/slots', element: <ChooseSlotPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout/:reference', element: <CheckoutPage /> },
          { path: 'checkout/:bookingId', element: <CheckoutPage /> },
          { path: 'payment/return', element: <PaymentReturnPage /> },
          { path: 'bookings/:reference', element: <BookingDetailPage /> },
          { path: 'bookings/:reference', element: <BookingDetailPage /> },
          { path: 'bookings/:reference', element: <BookingDetailPage /> },
          { path: 'bookings/:bookingId', element: <BookingDetailPage /> },
          {
            path: 'account',
            element: <AccountPage />,
            children: [
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
    path: 'owner',
    element: <OwnerProtectedRoute />,
    children: [
      {
        element: <OwnerLayout />,
        children: [
          { index: true, element: <OwnerVenuesPage /> },
          { path: 'venues/new', element: <OwnerOnboardingPage /> },
          { path: 'venues/:venueId/courts', element: <OwnerCourtsPage /> },
          { path: 'venues/:venueId/calendar', element: <OwnerCalendarPage /> },
          { path: 'earnings', element: <OwnerEarningsPage /> },
          { path: 'profile', element: <OwnerProfilePage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}