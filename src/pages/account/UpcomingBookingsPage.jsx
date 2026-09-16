import React from 'react';
import { Paper, Chip, Button, Skeleton } from '@mui/material';
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
    <Paper elevation={1} className="p-6 !rounded-2xl !bg-white">
      <h2 className="text-2xl font-bold text-navy-900 mb-6">Upcoming Bookings</h2>
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <EventNote className="!text-5xl !text-slate-300 mb-2" />
          <p className="text-slate-500 mb-4">No upcoming bookings found.</p>
          <Button variant="contained" onClick={() => navigate('/search')} className="!bg-lime-500 !text-navy-900">Book a Court</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy-900">{b.venueName} - {b.courtName}</h3>
                <p className="text-sm text-slate-500">{b.date} | {formatTime(b.startTime)} - {formatTime(b.endTime)}</p>
              </div>
              <Button
                variant="outlined"
                onClick={() => navigate(`/bookings/${b.id}`)}
                endIcon=<ArrowForward />
                className="!text-xs !border-navy-700 !text-navy-700"
              >
                Details
              </Button>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
}