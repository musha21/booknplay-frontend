import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Chip, Button, Skeleton, Divider,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
  Download, Cancel, ArrowBack
} from '@mui/icons-material';
import {
  useBookingDetail, useCancelBooking
} from '../hooks/useBookings';
import {
  downloadInvoicePdf
} from '../api/payments';
import { formatTime } from '../utils/formatters';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const { data: bookingData, isLoading } = useBookingDetail(bookingId);
  const cancelMutation = useCancelBooking();

  const booking = bookingData?.data;

  if (isLoading) {
    return (
      <Container maxWidth="md" className="py-12">
        <Skeleton variant="rectangle" height={300} className="rounded-2xl" />
      </Container>
    );
  }


  if (!booking) {
    return (
      <Container maxWidth="md" className="py-20 text-center">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Booking not found</h2>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/account/bookings')}>
          Back to Bookings
        </Button>
      </Container>
    );
  }

  const handleCancel = () => {
    cancelMutation.mutate(bookingId, {
      onSuccess: () => setOpenCancelDialog(false),
    });
  };

  const handleDownloadReceipt = async () => {
    try {
      const blob = await downloadInvoicePdf(bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${booking.bookingRef || bookingId}.pdf`;
      a.click();
    } catch (err) {
      console.error('Receipt download failed', err);
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen font-sans">
      <Container maxWidth="md">
        <Paper elevation={3} className="p-8 !rounded-3xl !bg-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Booking Reference</span>
              <h2 className="text-2xl font-extrabold text-navy-900">{booking.bookingRef || booking.id}</h2>
            </div>
            <Chip
              label={booking.status}
              className={`text-sm !font-bold !px-4 !py-1 ${
                booking.status === 'CONFIRMED'
                  ? '!bg-emerald-100 !text-emerald-700'
                  : '!bg-red-100 !text-red-700'
              }`}
            />
          </div>

          <Divider className="!my-6" />

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <span className="text-xs text-slate-400 block">Venue</span>
              <span className="text-base font-bold text-navy-900">{booking.venueName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Court</span>
              <span className="text-base font-bold text-navy-900">{booking.courtName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Date</span>
              <span className="text-base font-bold text-navy-900">{booking.date}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Time</span>
              <span className="text-base font-bold text-navy-900">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReceipt}
              className="!border-navy-700 !text-navy-700 !font-bold !py-3 !rounded-xl"
            >
              Download Receipt
            </Button>
            {booking.status === 'CONFIRMED' && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setOpenCancelDialog(true)}
                className="!font-bold !py-3 !rounded-xl"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </Paper>
      </Container>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Booking?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No, Keep It</Button>
          <Button onClick={handleCancel} color="error" disabled={cancelMutation.isPending}>
            {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
