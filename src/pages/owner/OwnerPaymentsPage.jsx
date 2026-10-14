import { useMemo, useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { Payments } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerPayments, useOwnerVenues } from '../../hooks/useOwner';

const pageRows = (data) => (Array.isArray(data) ? data : (data?.content ?? []));

export default function OwnerPaymentsPage() {
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const params = useMemo(() => ({
    ...(venueId ? { venueId } : {}),
    size: 50,
  }), [venueId]);
  const query = useOwnerPayments(params);
  const rows = pageRows(query.data);

  return (
    <OwnerPage>
      <OwnerPageHeader eyebrow="Commerce" title="Payments" description="Gateway payments linked to bookings." />
      <OwnerSection className="mt-6 max-w-xs">
        <TextField select fullWidth size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
          <MenuItem value="">All venues</MenuItem>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
      </OwnerSection>
      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={280} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState icon={Payments} title="No payments yet" description="Successful checkouts will appear here." />
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
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{row.bookingRef || row.bookingId?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted">{row.customerName || '—'}</td>
                    <td className="px-4 py-3 text-muted">{row.venueName}</td>
                    <td className="px-4 py-3 font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {row.currency || 'LKR'} {Number(row.amount || 0).toLocaleString('en-LK')}
                    </td>
                    <td className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-muted">{row.status}</td>
                    <td className="px-4 py-3 text-muted">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
