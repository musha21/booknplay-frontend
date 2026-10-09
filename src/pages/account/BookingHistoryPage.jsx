import { Chip, Skeleton } from '@mui/material';
import { useBookingHistory } from '../../hooks/useBookings';
import { formatBookingTimes } from '../../utils/formatters';

export default function BookingHistoryPage() {
  const { data, isLoading } = useBookingHistory();

  const bookings = data?.data?.content || [];

  if (isLoading) return <Skeleton variant="rectangle" height={200} className="rounded-2xl" />;

  return (
    <div className="customer-panel p-5 sm:p-7">
      <p className="eyebrow">Past activity</p>
      <h2 className="customer-card-title mt-2">Booking history</h2>
      <p className="customer-body mt-2">A record of your completed and previous reservations.</p>
      {bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-canvas/60 p-6">
          <p className="customer-body">No past bookings found.</p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {bookings.map((b) => (
            <div key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <h3 className="customer-card-title truncate">{b.venueName} - {b.courtName}</h3>
                <p className="customer-body mt-1">{b.date} | {formatBookingTimes(b)}</p>
              </div>
              <Chip label={b.status} className="!shrink-0 !bg-canvas !font-bold !text-ink" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
