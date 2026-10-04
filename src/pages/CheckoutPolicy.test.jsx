import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheckoutPage from './CheckoutPage';
import HelpPage from './account/HelpPage';

const bookingMocks = vi.hoisted(() => ({
  createBooking: vi.fn(),
  startPayment: vi.fn(),
  quote: {
    quoteId: 'quote-1',
    totalAmount: 3000,
    payNow: 900,
    balanceDue: 2100,
    balanceCollection: 'AT_VENUE',
    cancellationAllowed: true,
    cancellationDeadline: '2026-10-09T10:00:00+05:30',
    afterDeadlineSummary: 'After 1 hour from booking, cancellation is not available.',
    noShowSummary: 'No refund is available.',
    policyVersion: 2,
  },
}));

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { name: 'Maya Perera', email: 'maya@example.com', phone: '0771234567' },
    customer: null,
  }),
}));

vi.mock('../hooks/useBookings', () => ({
  useBookingQuote: () => ({ data: bookingMocks.quote, isLoading: false, isFetching: false, isError: false, refetch: vi.fn() }),
  useCreateBooking: () => ({ mutateAsync: bookingMocks.createBooking, isPending: false }),
  useInitiatePayment: () => ({ mutateAsync: bookingMocks.startPayment, isPending: false }),
}));

vi.mock('../utils/paymentGateway', () => ({
  isDummyPayment: false,
  PAYMENT_GATEWAY: 'PAYHERE',
}));

const checkoutState = {
  venueId: 'venue-1',
  venueName: 'Kandy Sports Club',
  courtName: 'Court 1',
  courtId: 'court-1',
  sportId: 'sport-1',
  date: '2026-10-10',
  totalPrice: 3000,
  slots: [{
    courtId: 'court-1',
    sportId: 'sport-1',
    startTime: '10:00',
    endTime: '11:00',
    price: 3000,
  }],
};

describe('checkout policy guard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    bookingMocks.createBooking.mockReset().mockResolvedValue({
      booking: {
        id: 'booking-1',
        bookingRef: 'BNP-1',
        status: 'PENDING',
      },
      paymentMode: 'PAYHERE',
    });
    bookingMocks.startPayment.mockReset().mockResolvedValue({
      status: 'PROCESSING',
      paymentUrl: 'http://localhost:8080/api/v1/public/payhere/checkout/token',
    });
  });

  it('shows only amounts and cancellation terms returned by the server quote', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/checkout', state: checkoutState }]}>
        <CheckoutPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Booking total')).toBeInTheDocument();
    expect(screen.getByText('Pay now')).toBeInTheDocument();
    expect(screen.getByText('Remaining balance')).toBeInTheDocument();
    expect(screen.getByText(/Cancel within 1 hour of booking for a full refund/i)).toBeInTheDocument();
    expect(screen.getByText(/After 1 hour from booking, cancellation is not available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to payment' })).toBeInTheDocument();
    expect(screen.queryByText(/30% Deposit|Payable Now|Booking Fee|50% fee/i)).not.toBeInTheDocument();
  });

  it('creates a pending booking then initiates PayHere payment', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/checkout', state: checkoutState }]}>
        <CheckoutPage />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

    await waitFor(() => expect(bookingMocks.createBooking).toHaveBeenCalled());
    expect(bookingMocks.createBooking.mock.calls[0][0].data.quoteId).toBe('quote-1');
    expect(bookingMocks.startPayment).toHaveBeenCalledWith({ bookingId: 'booking-1', gateway: 'PAYHERE' });
    await waitFor(() => expect(assign).toHaveBeenCalledWith('http://localhost:8080/api/v1/public/payhere/checkout/token'));
    vi.unstubAllGlobals();
  });

  it('returns to slot selection with the server conflict and does not start payment', async () => {
    bookingMocks.createBooking.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'This court was just booked by another customer.' } },
    });

    function SlotPage() {
      const slotLocation = useLocation();
      return <p>{slotLocation.state?.bookingConflict}</p>;
    }

    render(
      <MemoryRouter initialEntries={[{ pathname: '/checkout', state: checkoutState }]}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/venues/:venueId/slots" element={<SlotPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

    await waitFor(() => {
      expect(screen.getByText('This court was just booked by another customer.')).toBeInTheDocument();
    });
    expect(bookingMocks.startPayment).not.toHaveBeenCalled();
  });
});

describe('help cancellation policy guard', () => {
  it('describes the 1-hour-from-booking full-refund rule', () => {
    render(<HelpPage />);

    expect(screen.getByText(/1 hour from booking for a full refund/i)).toBeInTheDocument();
    expect(screen.queryByText(/6 hours|50% fee/i)).not.toBeInTheDocument();
  });
});
