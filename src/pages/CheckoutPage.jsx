import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBookingQuote, useCreateBooking, useInitiatePayment } from '../hooks/useBookings';
import { PAYMENT_GATEWAY } from '../utils/paymentGateway';
import { formatCurrency, formatTime, formatDate } from '../utils/formatters';
import { bookingIdempotencyKey, bookingRequestFromIntent, clearBookingIntent, readBookingIntent } from '../utils/bookingIntent';
import { PAYMENT_HOLD_NOTICE } from '../utils/paymentStatus';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Shield,
  Person,
  Lock,
} from '@mui/icons-material';

const quoteData = (response) => response?.data ?? response;

const formatDeadline = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, customer } = useAuthStore();
  const { mutateAsync: createBooking, isPending: isCreating } = useCreateBooking();
  const { mutateAsync: initiatePayment, isPending: isPaying } = useInitiatePayment();
  const busy = isCreating || isPaying;

  const checkoutState = location.state?.slots ? location.state : readBookingIntent();
  const bookingRequest = checkoutState
    ? bookingRequestFromIntent(checkoutState)
    : { ok: false, message: 'Please choose your venue and time slot first.' };
  const quoteQuery = useBookingQuote(bookingRequest.ok ? bookingRequest.request : null);
  const quote = quoteData(quoteQuery.data);

  const [contactInfo, setContactInfo] = useState({
    fullName: user?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
    email: user?.email || customer?.email || '',
    phoneNumber: user?.phone || customer?.phone || '',
    specialRequests: '',
  });

  const [error, setError] = useState(null);

  if (!checkoutState || !checkoutState.slots || checkoutState.slots.length === 0) {
    return (
      <main className="page-shell py-20">
        <div className="section-container">
          <section className="customer-panel mx-auto max-w-xl space-y-4 p-8 text-center">
            <h2 className="customer-page-title !text-2xl">No Booking Session Found</h2>
            <p className="customer-body">Please choose your venue and time slot first.</p>
            <Button variant="contained" onClick={() => navigate('/#venues')}>
              Find Venues
            </Button>
          </section>
        </div>
      </main>
    );
  }

  const { venueId, venueName, date, courtName, resourceLabel = 'Court', slots, totalPrice } = checkoutState;
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setError(null);

    if (!quote) {
      setError('The venue terms are not available yet. Reload the quote before continuing.');
      return;
    }

    if (!contactInfo.fullName.trim()) {
      setError('Please provide the booking contact name');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(contactInfo.email.trim())) {
      setError('Please provide a valid booking contact email');
      return;
    }

    if (!contactInfo.phoneNumber.trim()) {
      setError('Please provide a valid phone number for SMS booking confirmations');
      return;
    }

    if (!bookingRequest.ok) {
      setError(bookingRequest.message);
      return;
    }

    try {
      const res = await createBooking({
        data: {
          quoteId: quote.quoteId,
          contact: {
            fullName: contactInfo.fullName.trim(),
            email: contactInfo.email.trim(),
            phoneNumber: contactInfo.phoneNumber.trim(),
            specialRequests: contactInfo.specialRequests.trim() || null,
          },
        },
        idempotencyKey: bookingIdempotencyKey(),
      });
      const checkout = res?.data ?? res;
      const bookingData = checkout?.booking;
      if (!bookingData?.id) throw new Error('The server did not return a booking.');
      const payment = await initiatePayment({ bookingId: bookingData.id, gateway: PAYMENT_GATEWAY });
      const paymentPayload = payment?.data ?? payment;
      clearBookingIntent();
      const checkoutUrl = String(paymentPayload?.paymentUrl || '').trim();
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      navigate(`/payment/return?bookingId=${bookingData.id}&reference=${bookingData.bookingRef || bookingData.bookingReference || ''}`, {
        state: { booking: bookingData, payment: paymentPayload ?? checkout.payment, paymentMode: checkout.paymentMode || 'PAYHERE' },
      });
    } catch (err) {
      const message = err.response?.data?.message || err.message
        || 'The booking could not be started. No slot was reserved.';
      if ([409, 410].includes(err.response?.status) && venueId) {
        const params = new URLSearchParams();
        if (checkoutState.courtId) params.set('courtId', checkoutState.courtId);
        if (date) params.set('date', date);
        navigate(`/venues/${venueId}/slots?${params}`, { state: { bookingConflict: message } });
        return;
      }
      setError(message);
    }
  };

  return (
    <main className="page-shell py-10">
      <div className="section-container !max-w-6xl">
        <div className="mb-8">
          <h1 className="customer-page-title">Complete Your Booking</h1>
          <p className="customer-body mt-1 !text-sm">
            Review your reservation details and pay securely with PayHere sandbox
          </p>
        </div>

        {(!bookingRequest.ok || error) && (
          <Alert
            severity={bookingRequest.ok ? 'error' : 'warning'}
            className="mb-6 !rounded-2xl !border !border-line"
            onClose={bookingRequest.ok ? () => setError(null) : undefined}
            action={
              venueId ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => navigate(`/venues/${venueId}/slots?courtId=${checkoutState.courtId || ''}`)}
                >
                  Change time slots
                </Button>
              ) : undefined
            }
          >
            {bookingRequest.ok ? error : bookingRequest.message}
          </Alert>
        )}

        {quoteQuery.isError && (
          <Alert
            severity="error"
            className="mb-6 !rounded-2xl !border !border-line"
            action={<Button color="inherit" size="small" onClick={() => quoteQuery.refetch()}>Retry quote</Button>}
          >
            {quoteQuery.error?.response?.data?.message || 'The venue booking terms could not be loaded. You cannot continue until the server provides a quote.'}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="customer-panel space-y-5 p-6 sm:p-8">
              <h2 className="customer-card-title flex items-center gap-2">
                <Person className="text-lime-600" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={contactInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  type="tel"
                  label="Phone Number"
                  name="phoneNumber"
                  value={contactInfo.phoneNumber}
                  onChange={handleInputChange}
                  required
                  helperText="Required for booking confirmations"
                />
                <TextField
                  fullWidth
                  label="Special Requests (Optional)"
                  name="specialRequests"
                  value={contactInfo.specialRequests}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4 text-xs text-muted">
              <Shield className="mt-0.5 shrink-0 text-muted" />
              <div className="space-y-1">
                <p className="font-bold text-ink">Cancellation policy</p>
                {quoteQuery.isLoading ? (
                  <p>Loading the venue policy…</p>
                ) : quote?.cancellationAllowed ? (
                  <>
                    <p>Cancel within 1 hour of booking for a full refund of the amount paid. After that hour, cancellation is not available.</p>
                    {quote.cancellationDeadline && <p>Free cancellation until {formatDeadline(quote.cancellationDeadline)}.</p>}
                    {quote.afterDeadlineSummary && <p>{quote.afterDeadlineSummary}</p>}
                  </>
                ) : quote ? (
                  <p>This venue does not allow customers to cancel this booking online.</p>
                ) : (
                  <p>Venue terms are unavailable.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="customer-panel sticky top-24 space-y-6 p-6">
              <h2 className="customer-card-title">Reservation Summary</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="customer-step-label !text-xs uppercase">Venue</div>
                  <div className="text-base font-bold text-ink">{venueName}</div>
                </div>

                <div>
                  <div className="customer-step-label !text-xs uppercase">{resourceLabel} & Date</div>
                  <div className="font-semibold text-ink">
                    {courtName || resourceLabel} • {formatDate(date)}
                  </div>
                </div>

                <div>
                  <div className="customer-step-label !text-xs uppercase">Selected Slots</div>
                  <div className="mt-1 space-y-1">
                    {slots.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-muted">
                          {formatTime(s.startTime)} - {formatTime(s.endTime)}
                        </span>
                        <span className="font-semibold text-ink">{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Divider />

              {quoteQuery.isLoading ? (
                <div className="flex items-center gap-3 text-sm font-bold text-muted">
                  <CircularProgress size={20} /> Calculating the venue terms…
                </div>
              ) : quote && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted">Booking total</span>
                    <span className="font-bold text-ink">{formatCurrency(quote.totalAmount ?? totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-ink">Pay now</span>
                    <span className="text-2xl font-black text-ink">{formatCurrency(quote.payNow)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted">Remaining balance</span>
                    <span className="font-bold text-ink">{formatCurrency(quote.balanceDue)}</span>
                  </div>
                  <p className="text-xs text-muted">
                    {quote.balanceCollection === 'AT_VENUE'
                      ? 'The remaining balance is collected at the venue.'
                      : Number(quote.balanceDue) > 0
                        ? 'The remaining balance must be paid online before the booking starts.'
                        : 'No remaining balance.'}
                  </p>
                </div>
              )}

              <Alert severity="info" className="!rounded-2xl !border !border-line">
                {PAYMENT_HOLD_NOTICE} You will complete payment on PayHere sandbox. The booking confirms after PayHere notifies the server.
              </Alert>

              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmAndPay}
                disabled={busy || !bookingRequest.ok || !quote?.quoteId || quoteQuery.isFetching}
                sx={{
                  backgroundColor: '#84cc16',
                  color: '#061032',
                  fontWeight: '800',
                  py: 1.8,
                  borderRadius: '16px',
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#65a30d',
                  },
                }}
              >
                {busy ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Continue to payment'
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                <Lock sx={{ fontSize: 14 }} /> 256-Bit SSL Encrypted & Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
