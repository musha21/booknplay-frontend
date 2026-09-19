import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { CancelOutlined, CheckCircleOutlined, ReceiptLong } from '@mui/icons-material';
import { useInitiatePayment, usePaymentStatus } from '../hooks/useBookings';

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get('bookingId') || '';
  const payment = usePaymentStatus(bookingId, { refetchInterval: (query) => query.state.data?.data?.status === 'PENDING' ? 3000 : false });
  const retry = useInitiatePayment();
  const status = payment.data?.data?.data?.status || payment.data?.data?.status || 'PENDING';
  const pending = payment.isLoading || status === 'PENDING';

  return (
    <main className="page-shell flex min-h-[75vh] items-center justify-center px-4 py-12"><section className="surface-card w-full max-w-lg p-8 text-center sm:p-10" aria-live="polite">
      {pending ? <><CircularProgress color="secondary" size={54} /><h1 className="mt-6 text-2xl font-black text-ink">Verifying your payment</h1><p className="mt-2 text-sm leading-6 text-muted">Keep this page open while we confirm the transaction with your payment provider.</p></> : status === 'COMPLETED' ? <><CheckCircleOutlined className="!text-7xl !text-green-500" /><p className="eyebrow mt-4">Booking confirmed</p><h1 className="mt-2 text-3xl font-black text-ink">You’re ready to play.</h1><p className="mt-3 text-sm text-muted">Your payment was successful and your booking is confirmed.</p><Button variant="contained" className="!mt-7" startIcon={<ReceiptLong />} onClick={() => navigate(`/bookings/${bookingId}`)}>View booking details</Button></> : <><CancelOutlined className="!text-7xl !text-red-500" /><p className="eyebrow mt-4 !text-red-500">Payment incomplete</p><h1 className="mt-2 text-3xl font-black text-ink">We couldn’t confirm payment.</h1><p className="mt-3 text-sm text-muted">Your court details are still available. Try the payment again or review the booking.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button variant="outlined" onClick={() => navigate(`/bookings/${bookingId}`)}>Review booking</Button><Button variant="contained" color="secondary" disabled={retry.isPending} onClick={() => retry.mutate({ bookingId, gateway: 'PAYHERE' })}>{retry.isPending ? 'Preparing…' : 'Try payment again'}</Button></div></>}
    </section></main>
  );
}
