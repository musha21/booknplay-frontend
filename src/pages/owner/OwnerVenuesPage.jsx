import { Link, useNavigate } from 'react-router-dom';
import { Button, Chip, LinearProgress, Skeleton } from '@mui/material';
import {
  Add, ArrowForward, CalendarMonth, CheckCircle, LocationOn, Settings,
  Stadium, TaskAlt,
} from '@mui/icons-material';
import { useOwnerVenues } from '../../hooks/useOwner';
import useAuthStore from '../../stores/authStore';
import VenueImage from '../../components/ui/VenueImage';
import EmptyState from '../../components/ui/EmptyState';
import { OwnerMetricCard, OwnerPageHeader, OwnerSectionHeader } from '../../components/owner/OwnerDashboardUi';

const courtCount = (venue) => venue.courtCount ?? venue.courts?.length ?? venue.facilityCount ?? 0;
const isLive = (venue) => venue.status === 'ACTIVE' || venue.status === 'APPROVED';

export default function OwnerVenuesPage() {
  const navigate = useNavigate();
  const owner = useAuthStore((state) => state.owner);
  const query = useOwnerVenues();
  const venues = query.data || [];
  const incompleteVenue = venues.find((venue) => (venue.setupPercent ?? 100) < 100);
  const setup = incompleteVenue?.setupPercent ?? 0;
  const totalCourts = venues.reduce((total, venue) => total + Number(courtCount(venue)), 0);
  const liveVenues = venues.filter(isLive).length;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-7xl pb-8">
      <OwnerPageHeader
        eyebrow="Partner overview"
        title={`${greeting}, ${owner?.ownerName || 'partner'}.`}
        description="A clear view of your venues, bookable spaces, and the actions that need attention."
        actions={<Button component={Link} to="/owner/venues/new" variant="contained" color="secondary" startIcon={<Add />}>Create venue</Button>}
      />

      <section aria-label="Business summary" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {query.isLoading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} variant="rounded" height={128} />) : <>
          <OwnerMetricCard icon={Stadium} label="Venues" value={venues.length} detail="Across your business" />
          <OwnerMetricCard icon={CheckCircle} label="Live venues" value={liveVenues} detail={`${venues.length - liveVenues} awaiting setup or review`} tone="lime" />
          <OwnerMetricCard icon={TaskAlt} label="Bookable spaces" value={totalCourts} detail="Courts, pitches, tables and lanes" tone="blue" />
          <OwnerMetricCard icon={CalendarMonth} label="Calendar access" value={liveVenues ? 'Ready' : 'Set up'} detail={liveVenues ? 'Open any live venue to manage today' : 'Publish a venue to manage bookings'} tone="amber" />
        </>}
      </section>

      {incompleteVenue && (
        <section className="mt-6 overflow-hidden rounded-[20px] border border-lime-300 bg-lime-50 dark:border-lime-800 dark:bg-lime-950/20">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip-lime">Action needed</span>
                <span className="text-xs font-bold text-muted">{setup}% complete</span>
              </div>
              <h2 className="mt-3 text-lg font-black text-ink">Finish setting up {incompleteVenue.name}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Add the remaining venue details so players can confidently discover and book every facility.</p>
              <LinearProgress color="secondary" variant="determinate" value={setup} className="!mt-4 !h-2 !max-w-xl !rounded-full" />
            </div>
            <Button component={Link} to={`/owner/venues/${incompleteVenue.id}/courts`} variant="contained" endIcon={<ArrowForward />}>Continue setup</Button>
          </div>
        </section>
      )}

      <section className="mt-10">
        <OwnerSectionHeader
          title="Your venues"
          description="Manage facilities, pricing and daily availability from one place."
          action={<span className="text-sm font-bold text-muted">{venues.length} total</span>}
        />

        {query.isLoading ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={390} />)}</div>
        ) : query.isError ? (
          <div className="surface-card mt-5 p-6 text-center">
            <p className="font-extrabold text-ink">We couldn’t load your venues.</p>
            <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
            <Button className="!mt-4" onClick={() => query.refetch()}>Try again</Button>
          </div>
        ) : venues.length === 0 ? (
          <div className="mt-5 surface-card p-5"><EmptyState icon={Stadium} title="Create your first venue" description="Add its location, courts, hours and pricing to start accepting bookings." actionLabel="Create venue" onAction={() => navigate('/owner/venues/new')} /></div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => {
              const live = isLive(venue);
              const facilities = courtCount(venue);
              return (
                <article key={venue.id} className="surface-card group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <div className="relative">
                    <VenueImage src={venue.coverImageUrl || venue.images?.[0] || venue.businessImageUrl} alt={venue.name} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy-900/65 to-transparent" />
                    <Chip
                      size="small"
                      label={live ? 'Live' : (venue.status || 'Draft')}
                      color={live ? 'success' : 'default'}
                      className="!absolute !right-3 !top-3 !shadow-sm"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="truncate text-lg font-black tracking-[-0.02em] text-ink">{venue.name}</h3>
                    <p className="mt-1 flex min-h-6 items-start gap-1.5 text-sm text-muted"><LocationOn className="!mt-0.5 !text-base" /> <span className="line-clamp-2">{venue.city || venue.address || 'Location not added'}</span></p>
                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-canvas/60 p-3">
                      <div><span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Facilities</span><strong className="mt-1 block text-lg text-ink">{facilities}</strong></div>
                      <div><span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Sport type</span><strong className="mt-1 block truncate text-sm text-ink">{venue.venueType || venue.sportName || 'Multi-sport'}</strong></div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                      <Button component={Link} to={`/owner/venues/${venue.id}/calendar`} variant="contained" startIcon={<CalendarMonth />} className="!flex-1">Calendar</Button>
                      <Button component={Link} to={`/owner/venues/${venue.id}/courts`} variant="outlined" startIcon={<Settings />} aria-label={`Manage ${venue.name} facilities`}>Manage</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
