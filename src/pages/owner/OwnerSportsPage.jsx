import { Skeleton } from '@mui/material';
import { SportsTennis } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerSports } from '../../hooks/useOwner';

export default function OwnerSportsPage() {
  const query = useOwnerSports();
  const rows = Array.isArray(query.data) ? query.data : [];

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Operations"
        title="Sports"
        description="Sports offered across your courts and venues."
      />
      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={220} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState
            icon={SportsTennis}
            title="No sports yet"
            description="Add courts with a sport to populate this list."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((sport) => (
              <article key={sport.sportId || sport.sportName} className="surface-card p-5">
                <h3 className="text-lg font-black text-ink">{sport.sportName}</h3>
                <p className="mt-2 text-sm text-muted">{sport.courtCount ?? 0} court{(sport.courtCount === 1) ? '' : 's'}</p>
                {(sport.venueNames || []).length > 0 && (
                  <p className="mt-3 text-xs font-bold text-muted">{sport.venueNames.join(' · ')}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
