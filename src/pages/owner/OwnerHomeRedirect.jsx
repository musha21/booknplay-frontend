import { Navigate } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import { useOwnerVenues } from '../../hooks/useOwner';
import { resolveOwnerHomePath } from '../../utils/ownerOverview';

/** `/owner` → primary venue calendar when venues exist. */
export default function OwnerHomeRedirect() {
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

  const target = resolveOwnerHomePath(venues || []);
  return <Navigate to={target} replace />;
}
