import dayjs from 'dayjs';
import {
  ApiErrorCode,
  PlanCode,
  SubscriptionAccessReason,
  SubscriptionStatus,
} from '../constants/apiTypes';

export const TRIAL_WARNING_DAYS = 14;
export const TRIAL_DURATION_DAYS = 90;
/** Ranges longer than this many days require advancedReportsEnabled. */
export const ADVANCED_REPORTS_DAY_THRESHOLD = 31;

export const BILLING_INTERVAL = /** @type {const} */ ({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
});

/** Feature flag: set VITE_OWNER_SUBSCRIPTIONS=false to hide billing UI. */
export function isOwnerSubscriptionsEnabled() {
  const raw = String(import.meta.env.VITE_OWNER_SUBSCRIPTIONS ?? 'true').trim().toLowerCase();
  return raw !== 'false' && raw !== '0';
}

export function normalizePlanCode(code) {
  const value = String(code || '').trim().toUpperCase();
  return Object.values(PlanCode).includes(value) ? value : '';
}

export function normalizeSubscriptionStatus(status) {
  const value = String(status || '').trim().toUpperCase();
  return Object.values(SubscriptionStatus).includes(value) ? value : '';
}

export function isTrialing(subscription) {
  const status = normalizeSubscriptionStatus(subscription?.status);
  const plan = normalizePlanCode(subscription?.planCode);
  return status === SubscriptionStatus.TRIALING || plan === PlanCode.TRIAL;
}

export function isExpired(subscription) {
  const status = normalizeSubscriptionStatus(subscription?.status);
  if (status === SubscriptionStatus.EXPIRED || status === SubscriptionStatus.CANCELED) return true;
  const end = subscription?.trialEndsAt || subscription?.currentPeriodEnd;
  if (!end) return false;
  return dayjs(end).isBefore(dayjs());
}

export function daysRemaining(subscription, now = dayjs()) {
  if (subscription?.daysRemaining != null && Number.isFinite(Number(subscription.daysRemaining))) {
    return Math.max(0, Math.ceil(Number(subscription.daysRemaining)));
  }
  const end = subscription?.trialEndsAt
    || (isTrialing(subscription) ? null : subscription?.currentPeriodEnd)
    || subscription?.currentPeriodEnd;
  if (!end) return null;
  const diff = dayjs(end).diff(dayjs(now), 'day', true);
  return Math.max(0, Math.ceil(diff));
}

/**
 * When subscription is missing (API not ready), allow mutate so owners are not locked out.
 * Prefer server access.canMutate when present.
 */
export function canMutateOwner(subscription) {
  if (!subscription) return true;
  if (subscription.access && typeof subscription.access.canMutate === 'boolean') {
    return subscription.access.canMutate;
  }
  const status = normalizeSubscriptionStatus(subscription.status);
  if (!status) return true;
  return (
    status === SubscriptionStatus.TRIALING
    || status === SubscriptionStatus.ACTIVE
    || status === SubscriptionStatus.PAST_DUE
  );
}

export function accessReason(subscription) {
  const explicit = String(subscription?.access?.reason || '').trim().toUpperCase();
  if (Object.values(SubscriptionAccessReason).includes(explicit)) return explicit;

  if (!subscription) return '';
  if (!canMutateOwner(subscription) || isExpired(subscription)) {
    return SubscriptionAccessReason.TRIAL_EXPIRED;
  }
  if (normalizeSubscriptionStatus(subscription.status) === SubscriptionStatus.ACTIVE
    && normalizePlanCode(subscription.planCode) !== PlanCode.TRIAL) {
    return SubscriptionAccessReason.SUBSCRIBED;
  }
  const remaining = daysRemaining(subscription);
  if (isTrialing(subscription) && remaining != null && remaining <= TRIAL_WARNING_DAYS) {
    return SubscriptionAccessReason.TRIAL_ENDING;
  }
  if (isTrialing(subscription)) return SubscriptionAccessReason.TRIAL_ACTIVE;
  return SubscriptionAccessReason.SUBSCRIBED;
}

export function trialProgress(subscription) {
  if (!isTrialing(subscription)) return null;
  const remaining = daysRemaining(subscription);
  if (remaining == null) return null;
  const used = Math.min(TRIAL_DURATION_DAYS, Math.max(0, TRIAL_DURATION_DAYS - remaining));
  return {
    remaining,
    used,
    total: TRIAL_DURATION_DAYS,
    percent: Math.round((used / TRIAL_DURATION_DAYS) * 100),
  };
}

export function planDisplayName(code) {
  const names = {
    [PlanCode.TRIAL]: 'Free trial',
    [PlanCode.STARTER]: 'Starter',
    [PlanCode.GROWTH]: 'Growth',
    [PlanCode.PRO]: 'Pro',
  };
  return names[normalizePlanCode(code)] || String(code || 'Plan');
}

export function statusDisplayLabel(status) {
  const labels = {
    [SubscriptionStatus.TRIALING]: 'Trial',
    [SubscriptionStatus.ACTIVE]: 'Active',
    [SubscriptionStatus.PAST_DUE]: 'Past due',
    [SubscriptionStatus.EXPIRED]: 'Expired',
    [SubscriptionStatus.CANCELED]: 'Canceled',
  };
  return labels[normalizeSubscriptionStatus(status)] || String(status || 'Unknown');
}

/** Paths that require an active/trialing subscription to mutate. */
export function isOwnerMutatePath(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/owner';
  if (path === '/owner/venues/new') return true;
  if (/\/owner\/venues\/[^/]+\/edit$/.test(path)) return true;
  if (/\/owner\/venues\/[^/]+\/courts$/.test(path)) return true;
  if (/\/owner\/venues\/[^/]+\/calendar$/.test(path)) return true;
  if (/\/owner\/venues\/[^/]+\/booking-policy$/.test(path)) return true;
  if ([
    '/owner/walk-in',
    '/owner/blocked-slots',
    '/owner/maintenance',
    '/owner/pricing',
    '/owner/promotions',
    '/owner/refunds',
    '/owner/settings',
  ].includes(path)) return true;
  return false;
}

/** Default limits when API omits them (mirrors backend seeder). */
export const FALLBACK_PLAN_LIMITS = {
  [PlanCode.TRIAL]: {
    maxVenues: 5,
    maxCourtsPerVenue: null,
    maxStaff: 3,
    calendarEnabled: true,
    walkInEnabled: true,
    earningsEnabled: true,
    reportsEnabled: true,
    advancedReportsEnabled: true,
    commissionPercent: 0,
  },
  [PlanCode.STARTER]: {
    maxVenues: 1,
    maxCourtsPerVenue: null,
    maxStaff: 1,
    calendarEnabled: true,
    walkInEnabled: true,
    earningsEnabled: true,
    reportsEnabled: false,
    advancedReportsEnabled: false,
    commissionPercent: 10,
  },
  [PlanCode.GROWTH]: {
    maxVenues: 5,
    maxCourtsPerVenue: null,
    maxStaff: 5,
    calendarEnabled: true,
    walkInEnabled: true,
    earningsEnabled: true,
    reportsEnabled: true,
    advancedReportsEnabled: false,
    commissionPercent: 10,
  },
  [PlanCode.PRO]: {
    maxVenues: null,
    maxCourtsPerVenue: null,
    maxStaff: null,
    calendarEnabled: true,
    walkInEnabled: true,
    earningsEnabled: true,
    reportsEnabled: true,
    advancedReportsEnabled: true,
    commissionPercent: 10,
  },
};

/** Placeholder catalog when the plans API is empty or unavailable. */
export const FALLBACK_SUBSCRIPTION_PLANS = [
  {
    code: PlanCode.STARTER,
    name: 'Starter',
    description: 'One venue workspace for independent courts and studios.',
    priceMonthly: 4990,
    priceYearly: 49900,
    currency: 'LKR',
    highlighted: false,
    features: ['1 venue', '1 staff seat', 'Unlimited courts', 'Calendar and walk-ins', 'Earnings overview'],
    sortOrder: 1,
    ...FALLBACK_PLAN_LIMITS[PlanCode.STARTER],
  },
  {
    code: PlanCode.GROWTH,
    name: 'Growth',
    description: 'Multi-venue operators who need reports and more capacity.',
    priceMonthly: 9990,
    priceYearly: 99900,
    currency: 'LKR',
    highlighted: true,
    features: ['Up to 5 venues', '5 staff seats', 'Reports', 'Priority support', 'Everything in Starter'],
    sortOrder: 2,
    ...FALLBACK_PLAN_LIMITS[PlanCode.GROWTH],
  },
  {
    code: PlanCode.PRO,
    name: 'Pro',
    description: 'Larger businesses that need scale and dedicated support.',
    priceMonthly: 19990,
    priceYearly: 199900,
    currency: 'LKR',
    highlighted: false,
    features: ['Unlimited venues', 'Unlimited staff', 'Advanced reporting', 'Dedicated onboarding', 'Everything in Growth'],
    sortOrder: 3,
    ...FALLBACK_PLAN_LIMITS[PlanCode.PRO],
  },
];

function asBool(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  return fallback;
}

/**
 * Resolve plan limits from a subscription (limits object) or plan catalog row.
 * Null max* means unlimited. Missing subscription → permissive defaults so UI stays usable offline.
 */
export function resolvePlanLimits(source) {
  if (!source) {
    return { ...FALLBACK_PLAN_LIMITS[PlanCode.PRO] };
  }
  const nested = source.limits && typeof source.limits === 'object' ? source.limits : null;
  const code = normalizePlanCode(source.planCode || source.code);
  const fallback = FALLBACK_PLAN_LIMITS[code] || FALLBACK_PLAN_LIMITS[PlanCode.PRO];
  const raw = nested || source;

  const hasExplicit = nested
    || raw.maxVenues !== undefined
    || raw.maxCourtsPerVenue !== undefined
    || raw.maxStaff !== undefined
    || raw.calendarEnabled !== undefined
    || raw.reportsEnabled !== undefined;

  if (!hasExplicit && !nested) {
    return { ...fallback };
  }

  const commissionRaw = raw.commissionPercent === undefined
    ? fallback.commissionPercent
    : Number(raw.commissionPercent);

  return {
    maxVenues: raw.maxVenues === undefined ? fallback.maxVenues : raw.maxVenues,
    maxCourtsPerVenue: raw.maxCourtsPerVenue === undefined
      ? fallback.maxCourtsPerVenue
      : raw.maxCourtsPerVenue,
    maxStaff: raw.maxStaff === undefined ? fallback.maxStaff : raw.maxStaff,
    calendarEnabled: asBool(raw.calendarEnabled, fallback.calendarEnabled),
    walkInEnabled: asBool(raw.walkInEnabled, fallback.walkInEnabled),
    earningsEnabled: asBool(raw.earningsEnabled, fallback.earningsEnabled),
    reportsEnabled: asBool(raw.reportsEnabled, fallback.reportsEnabled),
    advancedReportsEnabled: asBool(raw.advancedReportsEnabled, fallback.advancedReportsEnabled),
    commissionPercent: Number.isFinite(commissionRaw) ? commissionRaw : fallback.commissionPercent,
  };
}

export function canAddStaff(subscription, staffCount) {
  if (!canMutateOwner(subscription)) return false;
  const limits = resolvePlanLimits(subscription);
  if (limits.maxStaff == null) return true;
  const used = Number(subscription?.usage?.staffCount ?? staffCount ?? 0);
  return used < Number(limits.maxStaff);
}

export function formatLimitCount(max) {
  if (max == null || max === '') return 'Unlimited';
  const n = Number(max);
  if (!Number.isFinite(n)) return 'Unlimited';
  return String(n);
}

export function canCreateVenue(subscription, venueCount) {
  if (!canMutateOwner(subscription)) return false;
  const limits = resolvePlanLimits(subscription);
  if (limits.maxVenues == null) return true;
  const used = Number(subscription?.usage?.venueCount ?? venueCount ?? 0);
  return used < Number(limits.maxVenues);
}

export function canCreateCourt(subscription, courtCount) {
  if (!canMutateOwner(subscription)) return false;
  const limits = resolvePlanLimits(subscription);
  if (limits.maxCourtsPerVenue == null) return true;
  return Number(courtCount ?? 0) < Number(limits.maxCourtsPerVenue);
}

export function canUseCalendar(subscription) {
  if (!subscription) return true;
  return resolvePlanLimits(subscription).calendarEnabled;
}

export function canUseWalkIns(subscription) {
  if (!subscription) return true;
  const limits = resolvePlanLimits(subscription);
  return limits.calendarEnabled && limits.walkInEnabled;
}

export function canUseEarnings(subscription) {
  if (!subscription) return true;
  return resolvePlanLimits(subscription).earningsEnabled;
}

export function canUseReports(subscription) {
  if (!subscription) return true;
  return resolvePlanLimits(subscription).reportsEnabled;
}

export function canUseAdvancedReports(subscription) {
  if (!subscription) return true;
  return resolvePlanLimits(subscription).advancedReportsEnabled;
}

/** Inclusive day span for a YYYY-MM-DD from/to pair. */
export function reportRangeDayCount(from, to) {
  if (!from || !to) return 0;
  return dayjs(to).diff(dayjs(from), 'day') + 1;
}

export function canUseReportRange(subscription, from, to) {
  if (!canUseReports(subscription)) return false;
  const days = reportRangeDayCount(from, to);
  if (days <= ADVANCED_REPORTS_DAY_THRESHOLD) return true;
  return canUseAdvancedReports(subscription);
}

export function isPlanLimitError(error) {
  const code = String(error?.response?.data?.code || '').trim().toUpperCase();
  return error?.response?.status === 403 && code === ApiErrorCode.PLAN_LIMIT;
}

export function planLimitMessage(error, fallback = 'This action is not included in your current plan. Upgrade on Billing.') {
  if (isPlanLimitError(error)) {
    return error.response?.data?.message || fallback;
  }
  return error?.response?.data?.message || fallback;
}

export function resolvePlans(plans) {
  const list = Array.isArray(plans) ? plans.filter((plan) => normalizePlanCode(plan?.code) !== PlanCode.TRIAL) : [];
  if (list.length) {
    return [...list]
      .map((plan) => {
        const code = normalizePlanCode(plan.code);
        const limits = resolvePlanLimits(plan);
        return { ...plan, code, ...limits };
      })
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }
  return FALLBACK_SUBSCRIPTION_PLANS;
}
