import { useMemo, useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { Payments } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
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
      <OwnerSection className="mt-6 w-full max-w-xs">
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
                render: (row) => `${row.currency || 'LKR'} ${Number(row.amount || 0).toLocaleString('en-LK')}`,
              },
              { key: 'status', label: 'Status', render: (row) => row.status },
              {
                key: 'when',
                label: 'When',
                render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'),
              },
            ]}
          />
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
