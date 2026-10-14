import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { Stadium } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerCourts, useOwnerVenues } from '../../hooks/useOwner';
import ownerVenuesApi from '../../api/ownerVenues';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

export default function OwnerCourtsHubPage() {
  const { data: venues = [], isLoading: venuesLoading } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const [allCourts, setAllCourts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const singleQuery = useOwnerCourts(venueId || undefined);

  useEffect(() => {
    if (venues[0] && !venueId) {
      /* keep empty = all venues */
    }
  }, [venues, venueId]);

  useEffect(() => {
    if (venueId) return undefined;
    let cancelled = false;
    const load = async () => {
      setLoadingAll(true);
      try {
        const chunks = await Promise.all(
          venues.map(async (venue) => {
            try {
              const courts = unwrap(await ownerVenuesApi.listCourts(venue.id)) || [];
              return (Array.isArray(courts) ? courts : []).map((court) => ({
                ...court,
                venueId: venue.id,
                venueName: venue.name,
              }));
            } catch {
              return [];
            }
          }),
        );
        if (!cancelled) setAllCourts(chunks.flat());
      } finally {
        if (!cancelled) setLoadingAll(false);
      }
    };
    if (venues.length) load();
    else setAllCourts([]);
    return () => { cancelled = true; };
  }, [venues, venueId]);

  const rows = useMemo(() => {
    if (venueId) {
      return (singleQuery.data || []).map((court) => ({
        ...court,
        venueId,
        venueName: venues.find((v) => v.id === venueId)?.name,
      }));
    }
    return allCourts;
  }, [venueId, singleQuery.data, allCourts, venues]);

  const loading = venuesLoading || (venueId ? singleQuery.isLoading : loadingAll);

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Operations"
        title="Courts"
        description="All bookable spaces across your venues."
      />
      <OwnerSection className="mt-6 max-w-xs">
        <TextField select fullWidth size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
          <MenuItem value="">All venues</MenuItem>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
      </OwnerSection>
      <OwnerSection className="mt-6">
        {loading ? (
          <Skeleton variant="rounded" height={240} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState
            icon={Stadium}
            title="No courts yet"
            description="Add a court from a venue workspace."
            action={venues[0] ? (
              <RouterLink to={`/owner/venues/${venues[0].id}/courts`} className="btn-primary">Manage courts</RouterLink>
            ) : (
              <RouterLink to="/owner/venues/new" className="btn-primary">Create venue</RouterLink>
            )}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Court</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Sport</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((court) => (
                  <tr key={court.id} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{court.name}</td>
                    <td className="px-4 py-3 text-muted">{court.venueName}</td>
                    <td className="px-4 py-3 text-muted">{court.sportName || court.sport?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-muted">{court.status || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <RouterLink to={`/owner/venues/${court.venueId}/courts`} className="text-sm font-bold text-navy-700 dark:text-lime-300">
                        Manage
                      </RouterLink>
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
