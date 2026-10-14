import { Button, Chip, Skeleton } from '@mui/material';
import { ArrowForward, EventNote, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUpcomingBookings } from '../../hooks/useBookings';
import { formatBookingTimes } from '../../utils/formatters';
import { bookingStatusChrome, classifyPaymentStatus } from '../../utils/paymentStatus';

function canContinuePayment(booking) {
  if (booking?.status !== 'PENDING') return false;
  if (booking.paymentStatus == null || booking.paymentStatus === '') return true;
  return classifyPaymentStatus(booking.paymentStatus) === 'pending';
}

export default function UpcomingBookingsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useUpcomingBookings();

  const bookings = data?.data?.content || [];

  if (isLoading) return <Skeleton variant="rectangle" height={200} className="rounded-2xl" />;


  return (
    <div className="customer-panel p-5 sm:p-7">
      <p className="eyebrow">Your schedule</p>
      <h2 className="customer-card-title mt-2">Upcoming bookings</h2>
      <p className="customer-body mt-2">Review your next reservations and open their booking details.</p>
      {bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-canvas/60 px-5 py-10 text-center">
          <EventNote className="!mb-3 !text-5xl !text-muted" />
          <p className="customer-body mb-5">No upcoming bookings found.</p>
          <Button variant="contained" onClick={() => navigate('/#venues')} className="!bg-lime-400 !font-extrabold !text-navy-900 hover:!bg-lime-500">Book a space</Button>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {bookings.map((b) => {
            const resumePayment = canContinuePayment(b);
            return (
              <div key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="customer-card-title truncate">{b.venueName} - {b.courtName}</h3>
                    {b.status && (
                      <Chip
                        size="small"
                        label={b.status}
                        className={`!h-6 !text-[11px] !font-bold ${bookingStatusChrome(b.status)}`}
                      />
                    )}
                  </div>
                  <p className="customer-body mt-1">{b.date} | {formatBookingTimes(b)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                  {resumePayment && (
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/bookings/${b.id}`)}
                      startIcon={<Payment />}
                      className="!bg-lime-400 !font-bold !text-navy-900 hover:!bg-lime-500"
                    >
                      Continue payment
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    endIcon={<ArrowForward />}
                    className="!border-line !font-bold !text-ink hover:!border-lime-500"
                  >
                    Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
