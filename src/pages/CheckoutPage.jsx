import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreateBooking, useInitiatePayment } from '../hooks/useBookings';
import { formatCurrency, formatTime, formatDate } from '../utils/formatters';
import { clearBookingIntent, readBookingIntent, toApiTime } from '../utils/bookingIntent';
import { isDummyPayment, PAYMENT_GATEWAY } from '../utils/paymentGateway';
import {
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Shield,
  Person,
  CreditCard,
  Lock,
} from '@mui/icons-material';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, customer } = useAuthStore();
  const { mutateAsync: createBooking, isPending: isCreating } = useCreateBooking();
  const { mutateAsync: startPayment, isPending: isPaying } = useInitiatePayment();

  const checkoutState = location.state?.slots ? location.state : readBookingIntent();

  const [contactInfo, setContactInfo] = useState({
    fullName: user?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
    email: user?.email || customer?.email || '',
    phoneNumber: user?.phone || customer?.phone || '',
    specialRequests: '',
  });

  const [paymentType, setPaymentType] = useState('FULL'); // FULL or DEPOSIT
  const [error, setError] = useState(null);

  if (!checkoutState || !checkoutState.slots || checkoutState.slots.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">No Booking Session Found</h2>
        <p className="text-slate-500">Please choose your venue and time slot first.</p>
        <Button
          variant="contained"
          onClick={() => navigate('/search')}
          sx={{ backgroundColor: '#061032', borderRadius: '12px' }}
        >
          Find Venues
        </Button>
      </div>
    );
  }

  const { venueName, date, courtName, slots, totalPrice } = checkoutState;

  const depositRate = 0.3; // 30% deposit option
  const depositAmount = totalPrice * depositRate;
  const payableAmount = paymentType === 'FULL' ? totalPrice : depositAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setError(null);

    if (!contactInfo.phoneNumber.trim()) {
      setError('Please provide a valid phone number for SMS booking confirmations');
      return;
    }

    try {
      const sorted = [...slots].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
      const courtId = String(checkoutState.courtId || sorted[0].courtId);
      const sportId = String(checkoutState.sportId || sorted[0].sportId || '');
      if (!sportId) {
        setError('This court is missing a sport. Go back and choose the slot again.');
        return;
      }

      const sameCourt = sorted.every((slot) => String(slot.courtId || courtId) === courtId);
      const consecutive = sameCourt && sorted.every((slot, index) => (
        index === 0 || toApiTime(sorted[index - 1].endTime) === toApiTime(slot.startTime)
      ));
      const requests = consecutive
        ? [{
            courtId,
            sportId,
            date,
            startTime: toApiTime(sorted[0].startTime),
            endTime: toApiTime(sorted[sorted.length - 1].endTime),
          }]
        : sorted.map((slot) => ({
            courtId: String(slot.courtId || courtId),
            sportId: String(slot.sportId || sportId),
            date,
            startTime: toApiTime(slot.startTime),
            endTime: toApiTime(slot.endTime),
          }));

      let bookingData = null;
      for (const payload of requests) {
        const res = await createBooking(payload);
        bookingData = res?.data || res;
      }
      const payment = await startPayment({ bookingId: bookingData.id, gateway: PAYMENT_GATEWAY });
      clearBookingIntent();
      if (payment?.paymentUrl) {
        window.location.href = payment.paymentUrl;
        return;
      }
      navigate(`/payment/return?bookingId=${bookingData.id}&reference=${bookingData.bookingRef || bookingData.bookingReference || ''}`, {
        state: { booking: bookingData },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create booking hold. Slot may have been taken.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-navy-900">Complete Your Booking</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review your reservation details and complete checkout securely
          </p>
        </div>

        {error && (
          <Alert severity="error" className="mb-6 rounded-2xl" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contact & Payment Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
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
                  helperText="Required for instant SMS booking confirmations"
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

            {/* Payment Choice Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <CreditCard className="text-lime-600" />
                Payment Options
              </h2>
              {isDummyPayment && (
                <Alert severity="info" className="rounded-2xl">
                  Development payment is on. No money is taken. PayHere will replace this later.
                </Alert>
              )}

              <RadioGroup
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="space-y-3"
              >
                <div
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    paymentType === 'FULL'
                      ? 'border-navy-900 bg-navy-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setPaymentType('FULL')}
                >
                  <FormControlLabel
                    value="FULL"
                    control={<Radio color="primary" />}
                    label={
                      <div>
                        <div className="font-bold text-navy-900">Pay Full Amount</div>
                        <div className="text-xs text-slate-500">Pay now and skip on-site settlement</div>
                      </div>
                    }
                  />
                  <span className="font-black text-navy-900">{formatCurrency(totalPrice)}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    paymentType === 'DEPOSIT'
                      ? 'border-navy-900 bg-navy-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setPaymentType('DEPOSIT')}
                >
                  <FormControlLabel
                    value="DEPOSIT"
                    control={<Radio color="primary" />}
                    label={
                      <div>
                        <div className="font-bold text-navy-900">Pay 30% Deposit</div>
                        <div className="text-xs text-slate-500">
                          Pay remainder ({formatCurrency(totalPrice - depositAmount)}) at the venue
                        </div>
                      </div>
                    }
                  />
                  <span className="font-black text-navy-900">{formatCurrency(depositAmount)}</span>
                </div>
              </RadioGroup>
            </div>

            {/* Cancellation Terms */}
            <div className="bg-slate-100/70 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
              <Shield className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy-900">Flexible Cancellation: </span>
                Free cancellation up to 6 hours before slot start time. Full refund will be automatically credited back to your original payment method.
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 sticky top-24">
              <h2 className="text-lg font-bold text-navy-900">Reservation Summary</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Venue</div>
                  <div className="font-bold text-navy-900 text-base">{venueName}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Court & Date</div>
                  <div className="font-semibold text-slate-800">
                    {courtName || 'Court'} • {formatDate(date)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Selected Slots</div>
                  <div className="mt-1 space-y-1">
                    {slots.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">
                          {formatTime(s.startTime)} - {formatTime(s.endTime)}
                        </span>
                        <span className="font-semibold text-navy-900">{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Divider />

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Booking Fee</span>
                  <span className="text-lime-600 font-semibold">FREE</span>
                </div>
                <Divider />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-navy-900">Payable Now</span>
                  <span className="text-2xl font-black text-navy-900">
                    {formatCurrency(payableAmount)}
                  </span>
                </div>
                {paymentType === 'DEPOSIT' && (
                  <div className="text-xs text-slate-500 text-right">
                    Due at venue: {formatCurrency(totalPrice - depositAmount)}
                  </div>
                )}
              </div>

              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmAndPay}
                disabled={isCreating || isPaying}
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
                {isCreating || isPaying ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isDummyPayment ? (
                  `Confirm booking (dev payment) · ${formatCurrency(payableAmount)}`
                ) : (
                  `Pay ${formatCurrency(payableAmount)} & Confirm`
                )}
              </Button>

              <div className="text-center flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Lock sx={{ fontSize: 14 }} /> 256-Bit SSL Encrypted & Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
