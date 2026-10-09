import { useState } from 'react';
import { Skeleton, TextField } from '@mui/material';
import { People } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerCustomers } from '../../hooks/useOwner';

export default function OwnerCustomersPage() {
  const [q, setQ] = useState('');
  const query = useOwnerCustomers(q);
  const rows = Array.isArray(query.data) ? query.data : [];

  return (
    <OwnerPage>
      <OwnerPageHeader eyebrow="Commerce" title="Customers" description="People who have booked with your business." />
      <OwnerSection className="mt-6 max-w-md">
        <TextField fullWidth size="small" label="Search name, phone, or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </OwnerSection>
      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={280} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState icon={People} title="No customers found" description="Try a different search, or wait for bookings." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3">Spend</th>
                  <th className="px-4 py-3">Last booking</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key || row.customerId || `${row.phone}-${row.email}`} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{row.name || '—'}</td>
                    <td className="px-4 py-3 text-muted">{[row.phone, row.email].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="px-4 py-3 text-ink">{row.visitCount ?? 0}</td>
                    <td className="px-4 py-3 font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      LKR {Number(row.totalSpend || 0).toLocaleString('en-LK')}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.lastBookingDate || '—'}
                      {row.lastBookingRef ? ` · ${row.lastBookingRef}` : ''}
                    </td>
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
