import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chip, Button, Skeleton, Divider, Rating, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
  Download, Cancel, ArrowBack, Refresh, Payment, Star
} from '@mui/icons-material';
import {
  useBookingDetail, useCancellationPreview, useCancelBooking, useInitiatePayment, useCreateBookingReview
} from '../hooks/useBookings';
import {
  downloadInvoicePdf
} from '../api/payments';
import { formatBookingTimes, formatCurrency } from '../utils/formatters';
import { resourceLabelForCourt } from '../utils/courtResource';
import {
  bookingStatusChrome,
  classifyPaymentStatus,
  PAYMENT_HOLD_NOTICE,
} from '../utils/paymentStatus';
import { toast } from 'sonner';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data: bookingData, isLoading } = useBookingDetail(bookingId);
  const cancelMutation = useCancelBooking();
  const initiatePayment = useInitiatePayment();
  const createReview = useCreateBookingReview();
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

  const handleResumePayment = () => {
    initiatePayment.mutate(
      { bookingId, gateway: 'PAYHERE' },
      {
        onSuccess: (res) => {
          const payload = res?.data ?? res;
          const url = String(payload?.paymentUrl || '').trim();
          if (url) {
            window.location.assign(url);
            return;
          }
          toast.error('Payment could not be resumed. Try again from checkout.');
        },
      }
    );
  };

  const canResumePayment =
    booking.status === 'PENDING'
    && classifyPaymentStatus(booking.paymentStatus) === 'pending';
  const showRefundSummary =
    booking.status === 'CANCELLED'
    && (booking.refundAmount != null || booking.paymentStatus === 'REFUNDED'
      || booking.paymentStatus === 'PARTIALLY_REFUNDED');

  const handleSubmitReview = (event) => {
    event.preventDefault();
    if (!reviewRating) {
      toast.error('Please choose a rating.');
      return;
    }
    createReview.mutate({
      bookingId,
      venueId: booking.venueId,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });
  };

  return (
    <main className="page-shell py-10">
      <div className="section-container !max-w-4xl space-y-6">
        <section className="customer-panel p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="customer-step-label !text-xs uppercase">Booking Reference</span>
              <h1 className="customer-page-title mt-1 !text-2xl">{booking.bookingRef || booking.id}</h1>
            </div>
            <Chip
              label={booking.status}
              className={`text-sm !font-bold !px-4 !py-1 ${bookingStatusChrome(booking.status)}`}
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

          {showRefundSummary && (
            <div className="mb-6 rounded-2xl border border-line bg-canvas p-4 text-sm">
              <p className="font-bold text-ink">Refund</p>
              {booking.refundAmount != null && (
                <div className="mt-2 flex justify-between gap-5">
                  <span className="text-muted">Refund amount</span>
                  <strong>{formatCurrency(booking.refundAmount)}</strong>
                </div>
              )}
              {booking.paymentStatus && (
                <div className="mt-1 flex justify-between gap-5">
                  <span className="text-muted">Payment status</span>
                  <strong>{booking.paymentStatus}</strong>
                </div>
              )}
            </div>
          )}

          {canResumePayment && (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              {PAYMENT_HOLD_NOTICE} Tap Resume payment to finish on PayHere.
            </p>
          )}

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
            {canResumePayment && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<Payment />}
                onClick={handleResumePayment}
                disabled={initiatePayment.isPending}
                className="!rounded-xl !py-3 !font-bold"
              >
                {initiatePayment.isPending ? 'Opening PayHere…' : 'Resume payment'}
              </Button>
            )}
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

        {booking.canReview && (
          <section className="customer-panel p-6 sm:p-8">
            <p className="eyebrow">Share feedback</p>
            <h2 className="customer-card-title mt-1">Rate {booking.venueName}</h2>
            <p className="customer-body mt-2">
              Your name and message will appear on the venue booking page.
            </p>
            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              <div>
                <span className="mb-2 block text-sm font-bold text-ink">Rating</span>
                <Rating
                  name="booking-review-rating"
                  value={reviewRating}
                  onChange={(_, value) => setReviewRating(value || 0)}
                  icon={<Star fontSize="inherit" className="text-lime-500" />}
                  emptyIcon={<Star fontSize="inherit" />}
                />
              </div>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Your message"
                placeholder="How was your visit?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                inputProps={{ maxLength: 2000 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={createReview.isPending || !reviewRating}
                className="!rounded-xl !bg-navy-900 !px-6 !py-3 !font-bold !text-white hover:!bg-navy-800"
              >
                {createReview.isPending ? 'Submitting…' : 'Submit review'}
              </Button>
            </form>
          </section>
        )}

        {booking.hasReview && !booking.canReview && (
          <section className="customer-panel p-5 sm:p-6">
            <p className="font-bold text-ink">Thanks for your review.</p>
            <p className="customer-body mt-1">Your feedback is visible on the venue page.</p>
          </section>
        )}
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
                    : 'Cancellation is closed for this booking.')}
              </DialogContentText>
              {cancellationPreview.eligible ? (
                <div className="rounded-2xl border border-line bg-canvas p-4 text-sm">
                  <div className="flex justify-between gap-5 py-1"><span className="text-muted">Amount paid</span><strong>{formatCurrency(cancellationPreview.amountPaid)}</strong></div>
                  {Number(cancellationPreview.cancellationFee) > 0 && (
                    <div className="flex justify-between gap-5 py-1"><span className="text-muted">Cancellation fee</span><strong>{formatCurrency(cancellationPreview.cancellationFee)}</strong></div>
                  )}
                  <Divider className="!my-2" />
                  <div className="flex justify-between gap-5 py-1"><span className="font-bold text-ink">Refund</span><strong>{formatCurrency(cancellationPreview.refundAmount)}</strong></div>
                  {cancellationPreview.refundMethod && <p className="mt-2 text-xs text-muted">Refund method: {cancellationPreview.refundMethod}</p>}
                  {cancellationPreview.refundMode === 'PAYHERE' && Number(cancellationPreview.refundAmount) > 0 && (
                    <p className="mt-2 text-xs text-muted">
                      Refund returns to the same payment method you used at checkout (via PayHere). Banks can take a few days to show it.
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
