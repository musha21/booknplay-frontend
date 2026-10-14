import { useMemo, useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
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
      <OwnerSection className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TextField size="small" label="Search" value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
        <TextField select size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)} fullWidth>
          <MenuItem value="">All venues</MenuItem>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
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
          <OwnerResponsiveRows
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'ref', label: 'Ref', emphasize: true, render: (row) => row.bookingRef || row.id?.slice(0, 8) },
              { key: 'customer', label: 'Customer', render: (row) => row.customerName || row.guestName || '—' },
              { key: 'venue', label: 'Venue / Court', render: (row) => `${row.venueName} · ${row.courtName}` },
              { key: 'when', label: 'When', render: (row) => `${row.date} ${String(row.startTime || '').slice(0, 5)}` },
              {
                key: 'amount',
                label: 'Amount',
                emphasize: true,
                render: (row) => `LKR ${Number(row.totalAmount || 0).toLocaleString('en-LK')}`,
              },
              { key: 'status', label: 'Status', render: (row) => row.status },
            ]}
          />
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
