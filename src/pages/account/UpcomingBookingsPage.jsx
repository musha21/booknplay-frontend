import { Button, Skeleton } from '@mui/material';
import { ArrowForward, EventNote } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUpcomingBookings } from '../../hooks/useBookings';
import { formatTime } from '../../utils/formatters';

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
          {bookings.map((b) => (
            <div key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <h3 className="customer-card-title truncate">{b.venueName} - {b.courtName}</h3>
                <p className="customer-body mt-1">{b.date} | {formatTime(b.startTime)} - {formatTime(b.endTime)}</p>
              </div>
              <Button
                variant="outlined"
                onClick={() => navigate(`/bookings/${b.id}`)}
                endIcon={<ArrowForward />}
                className="!shrink-0 !border-line !font-bold !text-ink hover:!border-lime-500"
              >
                Details
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
