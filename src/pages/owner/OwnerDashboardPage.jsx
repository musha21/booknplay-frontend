import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Skeleton } from '@mui/material';
import {
  ArrowForward, EventAvailable, Payments, Stadium, TrendingUp, Upcoming,
} from '@mui/icons-material';
import {
  OwnerEmptyState,
  OwnerMetricCard,
  OwnerPage,
  OwnerPageHeader,
  OwnerSection,
  OwnerStagger,
} from '../../components/owner/OwnerDashboardUi';
import {
  useOwnerActivity,
  useOwnerDashboardToday,
  useOwnerEarnings,
  useOwnerVenues,
} from '../../hooks/useOwner';
import {
  REPORT_RANGE_PRESETS,
  reportRangeDates,
} from '../../utils/ownerReports';
import { isLiveVenueStatus } from '../../utils/venueStatus';
import { calculateVenueSetup } from '../../utils/venueSetup';

const formatMoney = (value, currency = 'LKR') =>
  `${currency} ${Number(value || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const ONBOARDING_STEPS = [
  { key: 'hasVenue', label: 'Add a venue', to: '/owner/venues/new' },
  { key: 'hasLiveVenue', label: 'Publish a venue', to: '/owner/venues' },
  { key: 'hasCourt', label: 'Add a court', to: '/owner/courts' },
  { key: 'hasOperatingHours', label: 'Set operating hours', to: '/owner/venues' },
  { key: 'hasPricing', label: 'Configure pricing', to: '/owner/pricing' },
];

export default function OwnerDashboardPage() {
  const dashQuery = useOwnerDashboardToday();
  const activityQuery = useOwnerActivity(12);
  const venuesQuery = useOwnerVenues(false);
  const mtdRange = useMemo(() => reportRangeDates(REPORT_RANGE_PRESETS.THIS_MONTH), []);
  const mtdQuery = useOwnerEarnings(mtdRange.from, mtdRange.to);
  const venues = venuesQuery.data || [];
  const data = dashQuery.data;
  const mtd = mtdQuery.data;
  const onboarding = data?.onboarding;
  const alerts = data?.alerts || [];
  const activity = Array.isArray(activityQuery.data) ? activityQuery.data : [];
  const currency = data?.currency || 'LKR';
  const liveCount = venues.filter((venue) => isLiveVenueStatus(venue.status)).length;
  const incompleteCount = venues.filter((venue) => !calculateVenueSetup(venue).isComplete).length;
  const mtdBookings = Number(mtd?.bookingCount ?? 0);
  const mtdGross = Number(mtd?.gross ?? 0);
  const mtdAvg = mtdBookings > 0 ? mtdGross / mtdBookings : 0;

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Today’s operations across your venues."
        actions={venues[0] ? (
          <Button component={RouterLink} to={`/owner/venues/${venues[0].id}/calendar`} variant="contained" color="secondary" className="!min-h-11">
            Open calendar
          </Button>
        ) : (
          <Button component={RouterLink} to="/owner/venues/new" variant="contained" color="secondary" className="!min-h-11">
            Create venue
          </Button>
        )}
      />

      {dashQuery.isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={128} className="!rounded-[20px]" />)}
        </div>
      ) : (
        <OwnerStagger className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <OwnerMetricCard icon={Payments} label="Today's revenue" value={formatMoney(data?.todaysRevenue, currency)} tone="lime" />
          <OwnerMetricCard icon={EventAvailable} label="Today's bookings" value={data?.todaysBookings ?? 0} tone="navy" />
          <OwnerMetricCard icon={TrendingUp} label="Occupancy" value={`${data?.occupancyPercent ?? 0}%`} tone="blue" />
          <OwnerMetricCard icon={Upcoming} label="Upcoming" value={data?.upcomingCount ?? 0} detail="Confirmed ahead" tone="amber" />
        </OwnerStagger>
      )}

      <OwnerSection className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-ink sm:text-xl">This month</h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">
              {mtdRange.from} – {mtdRange.to}
            </p>
          </div>
          <RouterLink
            to="/owner/reports"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-navy-900 hover:underline dark:text-lime-300"
          >
            View reports <ArrowForward className="!text-base" />
          </RouterLink>
        </div>
        {mtdQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={128} className="!rounded-[20px]" />)}
          </div>
        ) : mtdQuery.isError ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-canvas/60 px-4 py-3 text-sm text-muted">
            <span>Month totals could not be loaded.</span>
            <button type="button" className="btn-outline !min-h-9 !px-3 !text-xs" onClick={() => mtdQuery.refetch()}>
              Retry
            </button>
          </div>
        ) : (
          <OwnerStagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <OwnerMetricCard icon={EventAvailable} label="Total bookings" value={mtdBookings} detail="Confirmed + completed" tone="navy" />
            <OwnerMetricCard icon={Payments} label="Total revenue" value={formatMoney(mtdGross, currency)} detail="Gross" tone="lime" />
            <OwnerMetricCard icon={TrendingUp} label="Net earnings" value={formatMoney(mtd?.net, currency)} detail="After commission" tone="blue" />
            <OwnerMetricCard icon={Upcoming} label="Avg booking value" value={formatMoney(mtdAvg, currency)} detail="Gross ÷ bookings" tone="amber" />
          </OwnerStagger>
        )}
      </OwnerSection>

      <OwnerSection className="mt-8">
        <RouterLink
          to="/owner/venues"
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface px-4 py-4 transition hover:border-navy-900 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-navy-100">
              <Stadium fontSize="small" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-ink">Venues</p>
              <p className="mt-0.5 text-xs text-muted">Facility health across your business</p>
            </div>
          </div>
          {venuesQuery.isLoading ? (
            <Skeleton variant="rounded" width={220} height={28} />
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-ink">
              <span>{venues.length} total</span>
              <span className="text-muted">·</span>
              <span>{liveCount} live</span>
              <span className="text-muted">·</span>
              <span>{incompleteCount} need setup</span>
              <ArrowForward className="!text-base text-muted" />
            </div>
          )}
        </RouterLink>
      </OwnerSection>

      {onboarding && !onboarding.complete && (
        <OwnerSection className="mt-10">
          <h2 className="text-xl font-black text-ink">Get set up</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {ONBOARDING_STEPS.map((step) => {
              const done = Boolean(onboarding[step.key]);
              return (
                <li key={step.key}>
                  <RouterLink
                    to={step.to}
                    className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 text-sm font-bold ${
                      done
                        ? 'border-lime-300 bg-lime-50 text-navy-900 dark:border-lime-800 dark:bg-lime-900/20 dark:text-lime-100'
                        : 'border-line bg-surface text-ink hover:border-navy-900'
                    }`}
                  >
                    <span>{done ? '✓ ' : ''}{step.label}</span>
                    {!done && <span className="text-xs font-extrabold uppercase tracking-wider text-muted">Do this</span>}
                  </RouterLink>
                </li>
              );
            })}
          </ul>
        </OwnerSection>
      )}

      {alerts.length > 0 && (
        <OwnerSection className="mt-10">
          <h2 className="text-xl font-black text-ink">Alerts</h2>
          <ul className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <li
                key={`${alert.code}-${alert.message}`}
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  alert.severity === 'WARN' || alert.severity === 'WARNING'
                    ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
                    : 'border-line bg-canvas text-ink'
                }`}
              >
                <span className="font-extrabold uppercase tracking-wider text-xs text-muted">{alert.code}</span>
                <p className="mt-1 font-bold">{alert.message}</p>
              </li>
            ))}
          </ul>
        </OwnerSection>
      )}

      <OwnerSection className="mt-10">
        <h2 className="text-xl font-black text-ink">Recent activity</h2>
        {activityQuery.isLoading ? (
          <Skeleton variant="rounded" height={200} className="mt-4 !rounded-[20px]" />
        ) : activity.length === 0 ? (
          <div className="mt-4">
            <OwnerEmptyState
              icon={EventAvailable}
              title="No activity yet"
              description="Bookings and payments will show up here as they happen."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
            {activity.map((item) => (
              <li key={item.id} className="flex min-w-0 flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-ink sm:truncate">{item.summary}</p>
                  <p className="mt-0.5 break-words text-xs text-muted">
                    {[item.bookingRef, item.venueName, item.type].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <time className="shrink-0 text-xs font-bold text-muted">
                  {item.occurredAt ? new Date(item.occurredAt).toLocaleString() : '—'}
                </time>
              </li>
            ))}
          </ul>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
