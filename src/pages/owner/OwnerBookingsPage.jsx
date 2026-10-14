import { useMemo, useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerBookings, useOwnerVenues } from '../../hooks/useOwner';

const pageRows = (data) => (Array.isArray(data) ? data : (data?.content ?? []));

export default function OwnerBookingsPage() {
  const { data: venues = [] } = useOwnerVenues(false);
  const [status, setStatus] = useState('');
  const [venueId, setVenueId] = useState('');
  const [q, setQ] = useState('');
  const params = useMemo(() => ({
    ...(status ? { status } : {}),
    ...(venueId ? { venueId } : {}),
    ...(q.trim() ? { q: q.trim() } : {}),
    size: 50,
  }), [status, venueId, q]);
  const query = useOwnerBookings(params);
  const rows = pageRows(query.data);

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Operations"
        title="Bookings"
        description="All bookings across your venues."
      />
      <OwnerSection className="mt-6 grid gap-3 sm:grid-cols-3">
        <TextField size="small" label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <TextField select size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
          <MenuItem value="">All venues</MenuItem>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <MenuItem value="">All statuses</MenuItem>
          {['PENDING', 'HELD', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
      </OwnerSection>

      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={280} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState icon={EventAvailable} title="No bookings found" description="Try adjusting filters or wait for new bookings." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Venue / Court</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{row.bookingRef || row.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted">{row.customerName || row.guestName || '—'}</td>
                    <td className="px-4 py-3 text-muted">{row.venueName} · {row.courtName}</td>
                    <td className="px-4 py-3 text-ink">{row.date} {String(row.startTime || '').slice(0, 5)}</td>
                    <td className="px-4 py-3 font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      LKR {Number(row.totalAmount || 0).toLocaleString('en-LK')}
                    </td>
                    <td className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-muted">{row.status}</td>
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
