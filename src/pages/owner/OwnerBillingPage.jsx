import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Chip, Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { CheckCircleOutlined } from '@mui/icons-material';
import { OwnerPage, OwnerPageHeader, OwnerSection } from '../../components/owner/OwnerDashboardUi';
import {
  useOwnerSubscription,
  useSubscriptionCheckout,
  useSubscriptionPlans,
} from '../../hooks/useOwner';
import { formatCurrency } from '../../utils/formatters';
import {
  BILLING_INTERVAL,
  accessReason,
  canMutateOwner,
  daysRemaining,
  formatLimitCount,
  isOwnerSubscriptionsEnabled,
  isTrialing,
  planDisplayName,
  resolvePlanLimits,
  statusDisplayLabel,
  trialProgress,
} from '../../utils/subscription';
import { PlanCode, SubscriptionAccessReason } from '../../constants/apiTypes';

function UsageMeter({ label, used, max, hint, showBar = true }) {
  const unlimited = max == null || max === '';
  const cap = unlimited ? null : Number(max);
  const hasUsed = used != null && used !== '';
  const value = hasUsed ? Number(used) : null;
  const percent = !showBar || value == null || unlimited || !cap
    ? (unlimited ? 100 : 0)
    : Math.min(100, Math.round((value / cap) * 100));
  const over = showBar && value != null && !unlimited && cap != null && value >= cap;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-muted">{label}</p>
        <p className="text-sm font-black text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {hasUsed ? `${value} / ${formatLimitCount(max)}` : formatLimitCount(max)}
        </p>
      </div>
      {showBar && (
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-canvas">
          <div
            className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-lime-400'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default function OwnerBillingPage() {
  const enabled = isOwnerSubscriptionsEnabled();
  const subscriptionQuery = useOwnerSubscription({ enabled });
  const plansQuery = useSubscriptionPlans({ enabled });
  const checkout = useSubscriptionCheckout();
  const [interval, setInterval] = useState(BILLING_INTERVAL.MONTHLY);

  const subscription = subscriptionQuery.data;
  const plans = plansQuery.data || [];
  const remaining = daysRemaining(subscription);
  const progress = trialProgress(subscription);
  const reason = accessReason(subscription);
  const mutable = canMutateOwner(subscription);
  const currentCode = String(subscription?.planCode || '').toUpperCase();
  const limits = resolvePlanLimits(subscription);
  const venueUsed = Number(subscription?.usage?.venueCount ?? 0);
  const staffUsed = Number(subscription?.usage?.staffCount ?? 0);

  if (!enabled) {
    return (
      <OwnerPage className="max-w-3xl">
        <OwnerPageHeader
          eyebrow="Billing"
          title="Subscriptions are not enabled"
          description="Set VITE_OWNER_SUBSCRIPTIONS=true when the platform billing API is ready."
        />
      </OwnerPage>
    );
  }

  return (
    <OwnerPage className="max-w-6xl">
      <OwnerPageHeader
        eyebrow="Workspace"
        title="Billing"
        description="New businesses get 3 months free. After the trial, pick a plan to keep full owner access. Booking commission stays separate."
      />

      <OwnerSection className="mt-8 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-navy-900 via-navy-900 to-slate-800 p-6 text-white sm:p-8">
        {subscriptionQuery.isLoading ? (
          <Skeleton variant="rounded" height={96} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
        ) : subscriptionQuery.isError ? (
          <p className="text-sm text-white/70">Could not load subscription status. Try again shortly.</p>
        ) : !subscription ? (
          <p className="text-sm text-white/70">
            No subscription record yet. When the billing API is live, new businesses receive a 90-day free trial automatically.
          </p>
        ) : (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-lime-300/90">Current plan</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-black tracking-tight">{planDisplayName(subscription.planCode)}</h2>
                <Chip
                  size="small"
                  label={statusDisplayLabel(subscription.status)}
                  sx={{ bgcolor: 'rgba(190,242,100,0.2)', color: '#ecfccb', fontWeight: 800 }}
                />
              </div>
              <p className="mt-3 max-w-xl text-sm text-white/75">
                {isTrialing(subscription) && remaining != null
                  ? `${remaining} day${remaining === 1 ? '' : 's'} left on your free trial.`
                  : reason === SubscriptionAccessReason.TRIAL_EXPIRED
                    ? 'Trial ended — subscribe to restore editing.'
                    : `Access is ${mutable ? 'active' : 'view-only'}. Platform commission on this plan is ${Number(limits.commissionPercent ?? 10)}%.`}
              </p>
              {progress && (
                <div className="mt-5 max-w-md">
                  <div className="mb-1 flex justify-between text-xs font-bold text-white/70">
                    <span>Trial progress</span>
                    <span>{progress.used} / {progress.total} days</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-lime-400" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              )}
            </div>
            {!mutable && (
              <Button href="#plans" variant="contained" color="secondary" className="!font-extrabold">
                Choose a plan
              </Button>
            )}
          </div>
        )}
      </OwnerSection>

      {subscription && (
        <OwnerSection className="mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-ink">Plan usage</h2>
              <p className="mt-1 text-sm text-muted">
                Seats and venue caps come from your current plan. Manage staff on the Team page.
              </p>
            </div>
            <Button component={RouterLink} to="/owner/team" size="small" variant="outlined">
              Manage team
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <UsageMeter
              label="Venues"
              used={venueUsed}
              max={limits.maxVenues}
              hint="Live and draft venues that count toward your plan"
            />
            <UsageMeter
              label="Staff seats"
              used={staffUsed}
              max={limits.maxStaff}
              hint="Active staff members with portal access"
            />
            <UsageMeter
              label="Spaces per venue"
              max={limits.maxCourtsPerVenue}
              showBar={false}
              hint={limits.maxCourtsPerVenue == null ? 'Unlimited bookable spaces per venue' : `Up to ${limits.maxCourtsPerVenue} spaces per venue`}
            />
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-canvas/50 px-4 py-3 text-sm font-bold text-ink">
            Features:{' '}
            {[
              limits.calendarEnabled ? 'Calendar' : null,
              limits.walkInEnabled ? 'Walk-ins' : null,
              limits.earningsEnabled ? 'Earnings' : null,
              limits.reportsEnabled ? (limits.advancedReportsEnabled ? 'Advanced reports' : 'Reports') : null,
            ].filter(Boolean).join(' · ') || 'None'}
          </div>
        </OwnerSection>
      )}

      <OwnerSection id="plans" className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-ink">Plans</h2>
            <p className="mt-1 text-sm text-muted">
              Higher plans unlock more venues, staff seats, reports, and capacity. Platform booking commission is set per plan.
            </p>
          </div>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={interval}
            onChange={(_event, value) => { if (value) setInterval(value); }}
            aria-label="Billing interval"
          >
            <ToggleButton value={BILLING_INTERVAL.MONTHLY}>Monthly</ToggleButton>
            <ToggleButton value={BILLING_INTERVAL.YEARLY}>Yearly</ToggleButton>
          </ToggleButtonGroup>
        </div>

        {plansQuery.isLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((key) => <Skeleton key={key} variant="rounded" height={280} />)}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const code = String(plan.code || '').toUpperCase();
              const planLimits = resolvePlanLimits(plan);
              const price = interval === BILLING_INTERVAL.YEARLY
                ? (plan.priceYearly ?? plan.priceMonthly * 10)
                : plan.priceMonthly;
              const isCurrent = currentCode === code && mutable && !isTrialing(subscription);
              const features = Array.isArray(plan.features) ? plan.features : [];

              return (
                <article
                  key={code}
                  className={`flex flex-col rounded-2xl border p-5 ${
                    plan.highlighted
                      ? 'border-lime-400/70 bg-lime-50/40 dark:bg-lime-950/20'
                      : 'border-line bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-ink">{plan.name || planDisplayName(code)}</h3>
                      {plan.highlighted && (
                        <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-lime-700 dark:text-lime-300">
                          Recommended
                        </p>
                      )}
                    </div>
                    {isCurrent && <Chip size="small" color="success" label="Current" />}
                  </div>
                  <p className="mt-3 text-sm text-muted">{plan.description}</p>
                  <p className="mt-5 text-3xl font-black tracking-[-0.03em] text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(price, plan.currency || 'LKR')}
                    <span className="ml-1 text-sm font-bold text-muted">
                      / {interval === BILLING_INTERVAL.YEARLY ? 'year' : 'month'}
                    </span>
                  </p>
                  <p className="mt-3 text-sm font-bold text-ink">
                    {formatLimitCount(planLimits.maxStaff)} staff · {formatLimitCount(planLimits.maxVenues)} venues
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">
                    Platform commission: {Number(plan.commissionPercent ?? planLimits.commissionPercent ?? 10)}%
                  </p>
                  <ul className="mt-5 flex-1 space-y-2">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                        <CheckCircleOutlined className="!mt-0.5 !text-base !text-lime-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    color="secondary"
                    className="!mt-6 !font-extrabold"
                    disabled={isCurrent || checkout.isPending || code === PlanCode.TRIAL}
                    onClick={() => checkout.mutate({ planCode: code, billingInterval: interval })}
                  >
                    {isCurrent ? 'Current plan' : checkout.isPending ? 'Starting…' : 'Subscribe'}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
