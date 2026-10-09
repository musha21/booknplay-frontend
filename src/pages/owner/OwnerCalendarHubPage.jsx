import { Navigate, Link as RouterLink } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerVenues } from '../../hooks/useOwner';
import { isLiveVenueStatus } from '../../utils/venueStatus';

/** `/owner/calendar` → venue calendar when a venue exists; otherwise a short hint. */
export default function OwnerCalendarHubPage() {
  const { data: venues, isLoading, isError } = useOwnerVenues(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={220} />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/owner/venues" replace />;
  }

  const list = venues || [];
  const live = list.find((venue) => isLiveVenueStatus(venue?.status));
  const venue = live || list[0];
  if (venue?.id) {
    return <Navigate to={`/owner/venues/${venue.id}/calendar`} replace />;
  }

  return (
    <OwnerPage>
      <OwnerPageHeader eyebrow="Operations" title="Calendar" description="Pick a venue to manage daily slots." />
      <div className="mt-6">
        <OwnerEmptyState
          icon={CalendarMonth}
          title="No venue yet"
          description="Create a venue first, then open its calendar from the venue selector."
          action={<RouterLink to="/owner/venues/new" className="btn-primary">Create venue</RouterLink>}
        />
      </div>
    </OwnerPage>
  );
}
