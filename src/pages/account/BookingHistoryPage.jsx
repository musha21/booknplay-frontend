import { Paper, Chip, Skeleton } from '@mui/material';
import { useBookingHistory } from '../../hooks/useBookings';
import { formatTime } from '../../utils/formatters';

export default function BookingHistoryPage() {
  const { data, isLoading } = useBookingHistory();

  const bookings = data?.data?.content || [];

  if (isLoading) return <Skeleton variant="rectangle" height={200} className="rounded-2xl" />;

  return (
    <Paper elevation={1} className="p-6 !rounded-2xl !bg-white">
      <h2 className="text-2xl font-bold text-navy-900 mb-6">Booking History</h2>
      {bookings.length === 0 ? (
        <p className="text-slate-500">No past bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy-900">{b.venueName} - {b.courtName}</h3>
                <p className="text-sm text-slate-500">{b.date} | {formatTime(b.startTime)} - {formatTime(b.endTime)}</p>
              </div>
              <Chip label={b.status} className="!font-bold" />
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
}
