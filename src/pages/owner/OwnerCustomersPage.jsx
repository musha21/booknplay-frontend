import { useState } from 'react';
import { Skeleton, TextField } from '@mui/material';
import { People } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
import { useOwnerCustomers } from '../../hooks/useOwner';

export default function OwnerCustomersPage() {
  const [q, setQ] = useState('');
  const query = useOwnerCustomers(q);
  const rows = Array.isArray(query.data) ? query.data : [];

  return (
    <OwnerPage>
      <OwnerPageHeader eyebrow="Commerce" title="Customers" description="People who have booked with your business." />
      <OwnerSection className="mt-6 w-full max-w-md">
        <TextField fullWidth size="small" label="Search name, phone, or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </OwnerSection>
      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={280} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState icon={People} title="No customers found" description="Try a different search, or wait for bookings." />
        ) : (
          <OwnerResponsiveRows
            rows={rows}
            getRowKey={(row) => row.key || row.customerId || `${row.phone}-${row.email}`}
            columns={[
              { key: 'name', label: 'Name', emphasize: true, render: (row) => row.name || '—' },
              {
                key: 'contact',
                label: 'Contact',
                render: (row) => [row.phone, row.email].filter(Boolean).join(' · ') || '—',
              },
              { key: 'visits', label: 'Visits', render: (row) => row.visitCount ?? 0 },
              {
                key: 'spend',
                label: 'Spend',
                emphasize: true,
                render: (row) => `LKR ${Number(row.totalSpend || 0).toLocaleString('en-LK')}`,
              },
              {
                key: 'last',
                label: 'Last booking',
                render: (row) => `${row.lastBookingDate || '—'}${row.lastBookingRef ? ` · ${row.lastBookingRef}` : ''}`,
              },
            ]}
          />
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
