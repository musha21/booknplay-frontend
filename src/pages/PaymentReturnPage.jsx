import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { CancelOutlined, CheckCircleOutlined, InfoOutlined, ReceiptLong, Replay } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { usePaymentStatus } from '../hooks/useBookings';
import { getBookingByRef } from '../api/bookings';
import {
  isPaymentReturnTimedOut,
  paymentRedirectUrl,
  paymentReturnBookingParams,
  paymentReturnOutcome,
  paymentReturnPollInterval,
  PAYMENT_HOLD_NOTICE,
} from '../utils/paymentStatus';

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { bookingId: paramBookingId, orderId } = paymentReturnBookingParams(params);
  const [resolvedBookingId, setResolvedBookingId] = useState(paramBookingId);
  const [resolvingRef, setResolvingRef] = useState(false);
  const [resolveError, setResolveError] = useState(false);
  const invalidatedRef = useRef(false);

  useEffect(() => {
    setResolvedBookingId(paramBookingId);
    setResolveError(false);
  }, [paramBookingId]);

  useEffect(() => {
    if (paramBookingId || !orderId) return undefined;
    let cancelled = false;
    setResolvingRef(true);
    setResolveError(false);
    getBookingByRef(orderId)
      .then((res) => {
        if (cancelled) return;
        const booking = res?.data ?? res;
        if (booking?.id) {
          setResolvedBookingId(String(booking.id));
          return;
        }
        setResolveError(true);
      })
      .catch(() => {
        if (!cancelled) setResolveError(true);
      })
      .finally(() => {
        if (!cancelled) setResolvingRef(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paramBookingId, orderId]);

  const bookingId = resolvedBookingId;
  const payment = usePaymentStatus(bookingId, {
    refetchInterval: paymentReturnPollInterval,
  });
  const timedOut = isPaymentReturnTimedOut(payment);
  const waitingOnRef = Boolean(!bookingId && orderId && (resolvingRef || !resolveError));
  const outcome = waitingOnRef
    ? 'pending'
    : paymentReturnOutcome({
      bookingId,
      serverStatus: payment.data?.status,
      isLoading: payment.isLoading || payment.isFetching,
      isError: payment.isError || (Boolean(orderId) && resolveError && !bookingId),
      timedOut,
    });
  const continueUrl = paymentRedirectUrl(payment.data);

  useEffect(() => {
    if (outcome !== 'confirmed' || invalidatedRef.current || !bookingId) return;
    invalidatedRef.current = true;
    queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['paymentStatus', bookingId] });
  }, [outcome, bookingId, queryClient]);

  const openBooking = () => {
    if (bookingId) navigate(`/bookings/${bookingId}`);
    else navigate('/account/bookings');
  };
  const resumePayment = () => {
    if (continueUrl) {
      window.location.assign(continueUrl);
      return;
    }
    if (bookingId) navigate(`/bookings/${bookingId}`);
  };

  return (
    <main className="page-shell flex min-h-[75vh] items-center py-12">
      <div className="section-container">
        <section className="customer-panel mx-auto w-full max-w-lg p-8 text-center sm:p-10" aria-live="polite">
          {outcome === 'invalid' ? (
            <>
              <CancelOutlined className="!text-7xl !text-red-500" />
              <h1 className="customer-page-title mt-6 !text-2xl">Missing booking reference</h1>
              <p className="customer-body mt-2 !text-sm">Open this confirmation from your booking history.</p>
              <Button variant="outlined" className="!mt-7" onClick={() => navigate('/account/bookings')}>My bookings</Button>
            </>
          ) : outcome === 'pending' ? (
            <>
              <CircularProgress color="secondary" size={54} />
              <h1 className="customer-page-title mt-6 !text-2xl">Verifying your payment</h1>
              <p className="customer-body mt-2 !text-sm">Waiting for PayHere sandbox confirmation. This page updates automatically.</p>
              <p className="customer-body mt-3 !text-sm !text-muted">{PAYMENT_HOLD_NOTICE}</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {continueUrl ? (
                  <Button variant="outlined" onClick={resumePayment}>Continue payment</Button>
                ) : null}
                {bookingId ? (
                  <Button variant="outlined" startIcon={<ReceiptLong />} onClick={openBooking}>
                    View booking
                  </Button>
                ) : null}
              </div>
            </>
          ) : outcome === 'timeout' ? (
            <>
              <InfoOutlined className="!text-7xl !text-amber-500" />
              <h1 className="customer-page-title mt-6 !text-2xl">Still waiting on confirmation</h1>
              <p className="customer-body mt-2 !text-sm">
                PayHere has not confirmed this payment yet. Open your booking for the latest status, or resume payment from the booking page.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button variant="outlined" onClick={resumePayment}>
                  {continueUrl ? 'Continue payment' : 'Resume on booking'}
                </Button>
                <Button variant="contained" startIcon={<ReceiptLong />} onClick={openBooking}>
                  View booking
                </Button>
              </div>
            </>
          ) : outcome === 'confirmed' ? (
            <>
              <CheckCircleOutlined className="!text-7xl !text-green-500" />
              <p className="eyebrow mt-4">Booking confirmed</p>
              <h1 className="customer-page-title mt-2">You’re ready to play.</h1>
              <p className="customer-body mt-3 !text-sm">PayHere sandbox payment succeeded and your booking is confirmed.</p>
              <Button variant="contained" className="!mt-7" startIcon={<ReceiptLong />} onClick={openBooking}>View booking details</Button>
            </>
          ) : outcome === 'refunded' ? (
            <>
              <Replay className="!text-7xl !text-sky-500" />
              <p className="eyebrow mt-4">Refund recorded</p>
              <h1 className="customer-page-title mt-2">This payment was refunded.</h1>
              <p className="customer-body mt-3 !text-sm">Booking details contain the refund status.</p>
              <Button variant="contained" className="!mt-7" startIcon={<ReceiptLong />} onClick={openBooking}>View booking details</Button>
            </>
          ) : outcome === 'partial' ? (
            <>
              <InfoOutlined className="!text-7xl !text-amber-500" />
              <p className="eyebrow mt-4">Refund status on record</p>
              <h1 className="customer-page-title mt-2">A refund was recorded for this payment.</h1>
              <p className="customer-body mt-3 !text-sm">Open the booking for the recorded refund amount and status.</p>
              <Button variant="contained" className="!mt-7" startIcon={<ReceiptLong />} onClick={openBooking}>View booking details</Button>
            </>
          ) : outcome === 'error' ? (
            <>
              <InfoOutlined className="!text-7xl !text-amber-500" />
              <h1 className="customer-page-title mt-6 !text-2xl">Status temporarily unavailable</h1>
              <p className="customer-body mt-2 !text-sm">No new payment was started. Retry the status check or open your bookings.</p>
              <div className="mt-7 flex justify-center gap-3">
                <Button variant="outlined" onClick={() => payment.refetch()}>Retry status</Button>
                <Button variant="contained" onClick={() => navigate('/account/bookings')}>My bookings</Button>
              </div>
            </>
          ) : (
            <>
              <CancelOutlined className="!text-7xl !text-red-500" />
              <p className="eyebrow mt-4 !text-red-500">Payment incomplete</p>
              <h1 className="customer-page-title mt-2">The booking was not confirmed.</h1>
              <p className="customer-body mt-3 !text-sm">No slot should be reserved by this payment state.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button variant="outlined" onClick={resumePayment}>
                  {continueUrl ? 'Continue payment' : 'Resume on booking'}
                </Button>
                <Button variant="contained" onClick={openBooking}>Review booking</Button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
