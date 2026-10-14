import { useState } from 'react';
import { Skeleton, TextField } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import {
  OwnerDialog, OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
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
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Processed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{row.bookingRef || row.bookingId?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted">{row.customerName || '—'}</td>
                    <td className="px-4 py-3 text-muted">{row.venueName}</td>
                    <td className="px-4 py-3 font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      LKR {Number(row.amount || 0).toLocaleString('en-LK')}
                    </td>
                    <td className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-muted">{row.status}</td>
                    <td className="px-4 py-3 text-muted">{row.processedAt ? new Date(row.processedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
