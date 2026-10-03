import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button, Chip, LinearProgress, Skeleton } from '@mui/material';
import {
  Add, Archive, ArrowForward, Assessment, CalendarMonth, LocationOn, Policy, Settings, Stadium, Unarchive,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  useArchiveOwnerVenue,
  useOwnerEarnings,
  useOwnerSubscription,
  useOwnerVenues,
  useRestoreOwnerVenue,
} from '../../hooks/useOwner';
import useAuthStore from '../../stores/authStore';
import {
  OwnerConfirmDialog,
  OwnerPage,
  OwnerPageHeader,
  OwnerSectionHeader,
  OwnerStatRow,
  OwnerStatusBadge,
  OwnerStagger,
  OwnerTabBar,
} from '../../components/owner/OwnerDashboardUi';
import EarningsTrendChart from '../../components/owner/EarningsTrendChart';
import VenueCarousel from '../../components/ui/VenueCarousel';
import EmptyState from '../../components/ui/EmptyState';
import { todayOperations } from '../../utils/ownerOverview';
import { reportRangeDates, REPORT_RANGE_PRESETS } from '../../utils/ownerReports';
import { isLiveVenueStatus, isPendingVenueStatus, venueStatusLabel } from '../../utils/venueStatus';
import { calculateVenueSetup } from '../../utils/venueSetup';
import {
  canCreateVenue,
  canMutateOwner,
  daysRemaining,
  formatLimitCount,
  isOwnerSubscriptionsEnabled,
  isTrialing,
  planDisplayName,
  resolvePlanLimits,
} from '../../utils/subscription';
import { fadeUp } from '../../motion/variants';

const courtCount = (venue) => venue.courtCount ?? venue.courts?.length ?? venue.facilityCount ?? 0;

function statusTone(status) {
  if (isLiveVenueStatus(status)) return 'live';
  if (status === 'PENDING_APPROVAL') return 'info';
  if (status === 'REJECTED' || status === 'SUSPENDED') return 'danger';
  if (status === 'DRAFT' || status === 'DELETED') return 'warn';
  return 'neutral';
}

export default function OwnerVenuesPage() {
  const navigate = useNavigate();
  const owner = useAuthStore((state) => state.owner);
  const role = useAuthStore((state) => state.role);
  const isStaff = role === 'STAFF';
  const [tab, setTab] = useState('active');
  const [archiveTarget, setArchiveTarget] = useState(null);
  const archived = tab === 'archived';
  const query = useOwnerVenues(archived);
  const today = dayjs().format('YYYY-MM-DD');
  const weekRange = reportRangeDates(REPORT_RANGE_PRESETS.LAST_7_DAYS);
  const earningsQuery = useOwnerEarnings(today, today);
  const weekEarningsQuery = useOwnerEarnings(weekRange.from, weekRange.to, { enabled: !isStaff });
  const { data: subscription } = useOwnerSubscription();
  const archiveVenue = useArchiveOwnerVenue();
  const restoreVenue = useRestoreOwnerVenue();
  const venues = query.data || [];
  const todayTotals = todayOperations(earningsQuery.data);
  const calendarVenue = venues.find((venue) => isLiveVenueStatus(venue.status)) || venues[0];
  const subscriptionsEnabled = isOwnerSubscriptionsEnabled();
  const mutateAllowed = !subscriptionsEnabled || canMutateOwner(subscription);
  const limits = resolvePlanLimits(subscription);
  const venueLimitOk = !subscriptionsEnabled || canCreateVenue(subscription, venues.length);
  const trialDays = daysRemaining(subscription);

  const incompleteVenueData = !archived ? venues.reduce((acc, venue) => {
    if (acc) return acc;
    const setup = calculateVenueSetup(venue);
    return setup.isComplete ? null : { venue, setup };
  }, null) : null;

  const totalCourts = venues.reduce((total, venue) => total + Number(courtCount(venue)), 0);
  const liveVenues = venues.filter((venue) => isLiveVenueStatus(venue.status)).length;
  const pendingVenues = venues.filter((venue) => isPendingVenueStatus(venue.status)).length;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow={isStaff ? 'Staff overview' : 'Partner overview'}
        title={`${greeting}, ${owner?.ownerName || (isStaff ? 'staff member' : 'partner')}.`}
        description="Today’s confirmed bookings and gross revenue, plus the venues that still need setup."
        actions={(
          <>
            {subscriptionsEnabled && subscription && isTrialing(subscription) && trialDays != null && (
              <Chip
                component={Link}
                to="/owner/billing"
                clickable
                color="secondary"
                label={`Trial · ${trialDays}d left`}
                className="!font-extrabold"
              />
            )}
            {subscriptionsEnabled && subscription && !isTrialing(subscription) && (
              <Chip
                component={Link}
                to="/owner/billing"
                clickable
                variant="outlined"
                label={planDisplayName(subscription.planCode)}
                className="!font-extrabold"
              />
            )}
            {calendarVenue && !archived && (
              <Button component={Link} to={`/owner/venues/${calendarVenue.id}/calendar`} variant="outlined" startIcon={<CalendarMonth />}>
                Open calendar
              </Button>
            )}
            {!isStaff && (
              <Button component={Link} to="/owner/reports" variant="outlined" startIcon={<Assessment />}>
                View reports
              </Button>
            )}
            {!isStaff && mutateAllowed && venueLimitOk && (
              <Button component={Link} to="/owner/venues/new" variant="contained" color="secondary" startIcon={<Add />}>
                Create venue
              </Button>
            )}
            {!isStaff && mutateAllowed && !venueLimitOk && (
              <Button component={Link} to="/owner/billing" variant="contained" color="secondary">
                Upgrade for more venues ({formatLimitCount(limits.maxVenues)} max)
              </Button>
            )}
            {!isStaff && !mutateAllowed && (
              <Button component={Link} to="/owner/billing" variant="contained" color="secondary">
                Subscribe to create venues
              </Button>
            )}
          </>
        )}
      />

      <section aria-label="Business summary" className="mt-8 border-y border-line py-8">
        {query.isLoading || earningsQuery.isLoading ? (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton variant="rounded" height={112} />
              {!isStaff && <Skeleton variant="rounded" height={112} />}
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3">
              {[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={72} />)}
            </div>
          </div>
        ) : (
          <OwnerStatRow
            items={[
              {
                label: 'Today’s bookings',
                value: todayTotals ? todayTotals.bookings : '—',
                detail: earningsQuery.isError ? 'Couldn’t load today’s totals' : 'Confirmed and completed today',
                emphasis: true,
              },
              ...(!isStaff ? [{
                label: 'Today’s revenue',
                prefix: todayTotals ? 'LKR' : undefined,
                value: todayTotals
                  ? Number(todayTotals.revenue).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '—',
                detail: earningsQuery.isError ? 'Couldn’t load today’s totals' : 'Gross from those bookings',
                emphasis: true,
              }] : []),
              { label: 'Venues', value: venues.length, detail: archived ? 'Archived venues' : 'Across your business' },
              { label: 'Live venues', value: liveVenues, detail: `${pendingVenues} awaiting setup or review` },
              { label: 'Bookable spaces', value: totalCourts, detail: 'Courts, pitches, tables and lanes' },
            ]}
          />
        )}

        {!isStaff && (
          <div className="mt-8 border-t border-line pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Last 7 days</p>
                <p className="mt-1 text-sm text-muted">Bookings and net earnings trend</p>
              </div>
              <Button component={Link} to="/owner/reports" size="small" endIcon={<ArrowForward />}>
                Open reports
              </Button>
            </div>
            <div className="mt-4 max-w-md">
              {weekEarningsQuery.isLoading ? (
                <Skeleton variant="rounded" height={56} />
              ) : weekEarningsQuery.isError ? (
                <p className="text-sm text-muted">Couldn’t load the weekly trend.</p>
              ) : (
                <EarningsTrendChart summary={weekEarningsQuery.data} compact />
              )}
            </div>
          </div>
        )}
      </section>

      {incompleteVenueData && (
        <section className="mt-6 overflow-hidden rounded-[20px] border border-lime-300 bg-lime-50 p-5 dark:border-lime-800 dark:bg-lime-950/20 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip-lime">Action needed</span>
                <span className="text-xs font-bold text-muted">{incompleteVenueData.setup.percent}% complete</span>
              </div>
              <h2 className="mt-3 text-lg font-black text-ink">Finish setting up {incompleteVenueData.venue.name}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Complete the remaining venue setup steps to publish your bookable spaces for players.</p>
              <LinearProgress color="secondary" variant="determinate" value={incompleteVenueData.setup.percent} className="!mt-4 !h-2 !max-w-xl !rounded-full" />
              <div className="mt-4 flex flex-wrap gap-2">
                {incompleteVenueData.setup.checklist.map((item) => (
                  <Chip
                    key={item.id}
                    size="small"
                    color={item.isDone ? 'success' : 'default'}
                    variant={item.isDone ? 'filled' : 'outlined'}
                    label={`${item.isDone ? '✓' : '○'} ${item.title}`}
                  />
                ))}
              </div>
            </div>
            {incompleteVenueData.setup.nextIncompleteStep && (
              <Button
                component={Link}
                to={incompleteVenueData.setup.nextIncompleteStep.to}
                variant="contained"
                endIcon={<ArrowForward />}
              >
                {incompleteVenueData.setup.nextIncompleteStep.label}
              </Button>
            )}
          </div>
        </section>
      )}

      <section className="mt-10">
        <OwnerSectionHeader
          title="Your venues"
          description="Manage facilities, pricing and daily availability from one place."
          action={<span className="text-sm font-bold text-muted">{venues.length} total</span>}
        />

        {!isStaff && (
          <div className="mt-4 max-w-md">
            <OwnerTabBar
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
        )}

        {query.isLoading ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={390} />)}
          </div>
        ) : query.isError ? (
          <div className="surface-card mt-5 p-6 text-center">
            <p className="font-extrabold text-ink">We couldn’t load your venues.</p>
            <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
            <Button className="!mt-4" onClick={() => query.refetch()}>Try again</Button>
          </div>
        ) : venues.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={Stadium}
              title={archived ? 'No archived venues' : (isStaff ? 'No venues available' : 'Create your first venue')}
              description={
                archived
                  ? 'Archived venues can be restored from this tab.'
                  : (isStaff
                    ? 'No venues have been assigned to your workspace yet.'
                    : 'Add its location, bookable spaces, hours and pricing to start accepting bookings.')
              }
              actionLabel={!isStaff && !archived ? 'Create venue' : undefined}
              onAction={!isStaff && !archived ? () => navigate('/owner/venues/new') : undefined}
            />
          </div>
        ) : (
          <OwnerStagger className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => {
              const live = isLiveVenueStatus(venue.status);
              const facilities = courtCount(venue);
              return (
                <motion.article
                  key={venue.id}
                  variants={fadeUp}
                  className="surface-card group overflow-hidden transition duration-200"
                  whileHover={{ y: -3 }}
                >
                  <div className="relative">
                    <VenueCarousel venue={venue} owner={owner} imageClassName="h-44 w-full object-cover" />
                    <div className="absolute right-3 top-3 z-20">
                      <OwnerStatusBadge tone={statusTone(venue.status)}>
                        {live ? 'Live' : venueStatusLabel(venue.status || 'DRAFT')}
                      </OwnerStatusBadge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="truncate text-lg font-black tracking-[-0.02em] text-ink">{venue.name}</h3>
                    <p className="mt-1 flex min-h-6 items-start gap-1.5 text-sm text-muted">
                      <LocationOn className="!mt-0.5 !text-base" />
                      <span className="line-clamp-2">{venue.city || venue.address || 'Location not added'}</span>
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-canvas/60 p-3">
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Facilities</span>
                        <strong className="mt-1 block text-lg text-ink">{facilities}</strong>
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Sport type</span>
                        <strong className="mt-1 block truncate text-sm text-ink">{venue.venueType || venue.sportName || 'Multi-sport'}</strong>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-2 border-t border-line pt-4">
                      {!archived && (
                        <>
                          <Button component={Link} to={`/owner/venues/${venue.id}/calendar`} variant="contained" startIcon={<CalendarMonth />} fullWidth>
                            Calendar
                          </Button>
                          <Button component={Link} to={`/owner/venues/${venue.id}/courts`} variant="outlined" startIcon={<Settings />} fullWidth>
                            Manage
                          </Button>
                          <Button component={Link} to={`/owner/venues/${venue.id}/booking-policy`} variant="outlined" startIcon={<Policy />} fullWidth>
                            Booking policy
                          </Button>
                        </>
                      )}
                      {!isStaff && !archived && (
                        <>
                          <Button component={Link} to={`/owner/venues/${venue.id}/edit`} variant="outlined" fullWidth>
                            Edit
                          </Button>
                          <Button
                            color="error"
                            variant="outlined"
                            startIcon={<Archive />}
                            fullWidth
                            onClick={() => setArchiveTarget(venue)}
                          >
                            Archive
                          </Button>
                        </>
                      )}
                      {!isStaff && archived && (
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<Unarchive />}
                          fullWidth
                          disabled={restoreVenue.isPending}
                          onClick={() => restoreVenue.mutate(venue.id)}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </OwnerStagger>
        )}
      </section>

      <OwnerConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title={`Archive ${archiveTarget?.name || 'this venue'}?`}
        description="Players will no longer see it in search. You can restore it later from the Archived tab."
        confirmLabel="Archive venue"
        danger
        loading={archiveVenue.isPending}
        onConfirm={async () => {
          try {
            await archiveVenue.mutateAsync(archiveTarget.id);
            setArchiveTarget(null);
          } catch {
            /* toast handled in hook */
          }
        }}
      />
    </OwnerPage>
  );
}
