import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chip, Button, Skeleton, Divider,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
  Download, Cancel, ArrowBack, Refresh
} from '@mui/icons-material';
import {
  useBookingDetail, useCancellationPreview, useCancelBooking
} from '../hooks/useBookings';
import {
  downloadInvoicePdf
} from '../api/payments';
import { formatBookingTimes, formatCurrency } from '../utils/formatters';
import { resourceLabelForCourt } from '../utils/courtResource';
import { toast } from 'sonner';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const { data: bookingData, isLoading } = useBookingDetail(bookingId);
  const cancelMutation = useCancelBooking();
  const previewQuery = useCancellationPreview(bookingId, { enabled: openCancelDialog });

  const booking = bookingData?.data;
  const cancellationPreview = previewQuery.data?.data ?? previewQuery.data;

  if (isLoading) {
    return (
      <main className="page-shell py-12">
        <div className="section-container !max-w-4xl">
          <Skeleton variant="rounded" height={300} className="!bg-surface" />
        </div>
      </main>
    );
  }


  if (!booking) {
    return (
      <main className="page-shell py-20">
        <div className="section-container">
          <section className="customer-panel mx-auto max-w-xl p-8 text-center">
            <h2 className="customer-page-title mb-3 !text-2xl">Booking not found</h2>
            <p className="customer-body mb-6">This booking may no longer be available.</p>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/account/bookings')}>
              Back to Bookings
            </Button>
          </section>
        </div>
      </main>
    );
  }
  const resourceLabel = resourceLabelForCourt(booking);

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
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Receipt download failed', err);
      toast.error(err?.response?.data?.message || 'Receipt download failed. Please try again.');
    }
  };

  return (
    <main className="page-shell py-10">
      <div className="section-container !max-w-4xl">
        <section className="customer-panel mb-8 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="customer-step-label !text-xs uppercase">Booking Reference</span>
              <h1 className="customer-page-title mt-1 !text-2xl">{booking.bookingRef || booking.id}</h1>
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
              <span className="block text-xs text-muted">Venue</span>
              <span className="text-base font-bold text-ink">{booking.venueName}</span>
            </div>
            <div>
              <span className="block text-xs text-muted">Sport</span>
              <span className="text-base font-bold text-ink">{booking.sportName || '—'}</span>
            </div>
            <div>
              <span className="block text-xs text-muted">{resourceLabel}</span>
              <span className="text-base font-bold text-ink">{booking.courtName}</span>
            </div>
            <div>
              <span className="block text-xs text-muted">Date</span>
              <span className="text-base font-bold text-ink">{booking.date}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs text-muted">Time</span>
              <span className="text-base font-bold text-ink">
                {formatBookingTimes(booking)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {booking.invoiceAvailable && <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReceipt}
                className="!rounded-xl !border-navy-700 !py-3 !font-bold !text-navy-700"
            >
              Download Receipt
            </Button>}
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
        </section>
      </div>

      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        slotProps={{ paper: { className: '!rounded-[18px] !border !border-line !bg-surface' } }}
      >
        <DialogTitle className="customer-card-title">Cancel Booking?</DialogTitle>
        <DialogContent>
          {previewQuery.isLoading ? (
            <DialogContentText className="customer-body">Calculating your cancellation terms…</DialogContentText>
          ) : previewQuery.isError ? (
            <div className="space-y-3">
              <DialogContentText className="customer-body !text-red-600">
                {previewQuery.error?.response?.data?.message || 'The cancellation terms could not be loaded.'}
              </DialogContentText>
              <Button startIcon={<Refresh />} onClick={() => previewQuery.refetch()}>Retry</Button>
            </div>
          ) : cancellationPreview ? (
            <div className="space-y-4">
              <DialogContentText className="customer-body">
                {cancellationPreview.message
                  || (cancellationPreview.eligible
                    ? 'Review the refund details before cancelling. This action cannot be undone.'
                    : 'Cancellation is only allowed within 1 hour of booking.')}
              </DialogContentText>
              {cancellationPreview.eligible ? (
                <div className="rounded-2xl border border-line bg-canvas p-4 text-sm">
                  <div className="flex justify-between gap-5 py-1"><span className="text-muted">Amount paid</span><strong>{formatCurrency(cancellationPreview.amountPaid)}</strong></div>
                  <Divider className="!my-2" />
                  <div className="flex justify-between gap-5 py-1"><span className="font-bold text-ink">Full refund</span><strong>{formatCurrency(cancellationPreview.refundAmount)}</strong></div>
                  {cancellationPreview.refundMethod && <p className="mt-2 text-xs text-muted">Refund method: {cancellationPreview.refundMethod}</p>}
                  {cancellationPreview.refundMode === 'PAYHERE' && Number(cancellationPreview.refundAmount) > 0 && (
                    <p className="mt-2 text-xs text-muted">
                      The full amount returns to the same payment method you used at checkout (via PayHere). Banks can take a few days to show it.
                    </p>
                  )}
                  {Number(cancellationPreview.refundAmount) > 0 && cancellationPreview.refundMode !== 'PAYHERE' && (
                    <p className="mt-2 text-xs text-muted">
                      The full refund returns to the original payment method used for this booking.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
        <DialogActions className="!border-t !border-line !px-6 !py-4">
          <Button onClick={() => setOpenCancelDialog(false)}>No, Keep It</Button>
          {cancellationPreview?.eligible && (
            <Button onClick={handleCancel} color="error" disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? 'Cancelling...' : 'Confirm cancellation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </main>
  );
}
