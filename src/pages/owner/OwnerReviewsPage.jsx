import { useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { RateReview } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerReviews, useOwnerVenues } from '../../hooks/useOwner';

const pageRows = (data) => (Array.isArray(data) ? data : (data?.content ?? []));

export default function OwnerReviewsPage() {
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const query = useOwnerReviews(venueId ? { venueId, size: 50 } : { size: 50 });
  const rows = pageRows(query.data);

  return (
    <OwnerPage>
      <OwnerPageHeader eyebrow="Workspace" title="Reviews" description="Customer feedback across your venues." />
      <OwnerSection className="mt-6 max-w-xs">
        <TextField select fullWidth size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
          <MenuItem value="">All venues</MenuItem>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
      </OwnerSection>
      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={240} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState icon={RateReview} title="No reviews yet" description="Reviews will appear after customers rate bookings." />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="surface-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-ink">{row.customerName || 'Guest'} · {row.rating ?? '—'}/5</p>
                  <p className="text-xs font-bold text-muted">{row.venueName} · {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</p>
                </div>
                {row.comment && <p className="mt-2 text-sm leading-6 text-muted">{row.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
