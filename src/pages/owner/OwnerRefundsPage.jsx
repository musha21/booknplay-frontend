import { useState } from 'react';
import { Skeleton, TextField } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import {
  OwnerDialog, OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
import { useOwnerRefunds, useRequestOwnerRefund } from '../../hooks/useOwner';

const pageRows = (data) => (Array.isArray(data) ? data : (data?.content ?? []));

export default function OwnerRefundsPage() {
  const query = useOwnerRefunds({ size: 50 });
  const refund = useRequestOwnerRefund();
  const rows = pageRows(query.data);
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('');

  const submit = async () => {
    if (!bookingId.trim()) return;
    await refund.mutateAsync({ bookingId: bookingId.trim(), reason: reason.trim() || undefined });
    setOpen(false);
    setBookingId('');
    setReason('');
  };

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Commerce"
        title="Refunds"
        description="Refund history and manual refund requests."
        actions={(
          <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
            Request refund
          </button>
        )}
      />
      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={280} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState
            icon={AccountBalanceWallet}
            title="No refunds yet"
            description="Processed refunds will list here."
            action={<button type="button" className="btn-primary" onClick={() => setOpen(true)}>Request refund</button>}
          />
        ) : (
          <OwnerResponsiveRows
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'booking', label: 'Booking', emphasize: true, render: (row) => row.bookingRef || row.bookingId?.slice(0, 8) },
              { key: 'customer', label: 'Customer', render: (row) => row.customerName || '—' },
              { key: 'venue', label: 'Venue', render: (row) => row.venueName },
              {
                key: 'amount',
                label: 'Amount',
                emphasize: true,
                render: (row) => `LKR ${Number(row.amount || 0).toLocaleString('en-LK')}`,
              },
              { key: 'status', label: 'Status', render: (row) => row.status },
              {
                key: 'processed',
                label: 'Processed',
                render: (row) => (row.processedAt ? new Date(row.processedAt).toLocaleString() : '—'),
              },
            ]}
          />
        )}
      </OwnerSection>

      <OwnerDialog
        open={open}
        onClose={() => !refund.isPending && setOpen(false)}
        title="Request refund"
        description="Provide the booking id to refund. The booking must be eligible for cancellation."
        actions={(
          <>
            <button type="button" className="btn-outline" disabled={refund.isPending} onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className="btn-primary" disabled={refund.isPending || !bookingId.trim()} onClick={submit}>
              {refund.isPending ? 'Submitting…' : 'Submit'}
            </button>
          </>
        )}
      >
        <div className="grid gap-3 pt-1">
          <TextField label="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} fullWidth size="small" />
          <TextField label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth size="small" multiline minRows={2} />
        </div>
      </OwnerDialog>
    </OwnerPage>
  );
}
