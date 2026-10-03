import { describe, expect, it } from 'vitest';
import {
  ApiErrorCode,
  PlanCode,
  SubscriptionAccessReason,
  SubscriptionStatus,
} from '../constants/apiTypes';
import {
  accessReason,
  canCreateCourt,
  canCreateVenue,
  canMutateOwner,
  canUseAdvancedReports,
  canUseReportRange,
  canUseReports,
  daysRemaining,
  formatLimitCount,
  isExpired,
  isOwnerMutatePath,
  isPlanLimitError,
  isTrialing,
  planDisplayName,
  planLimitMessage,
  resolvePlanLimits,
  resolvePlans,
  trialProgress,
  FALLBACK_SUBSCRIPTION_PLANS,
} from './subscription';

describe('subscription helpers', () => {
  it('detects trialing plans', () => {
    expect(isTrialing({ status: SubscriptionStatus.TRIALING, planCode: PlanCode.TRIAL })).toBe(true);
    expect(isTrialing({ status: SubscriptionStatus.ACTIVE, planCode: PlanCode.STARTER })).toBe(false);
  });

  it('treats missing subscription as mutable (API not ready)', () => {
    expect(canMutateOwner(null)).toBe(true);
    expect(canMutateOwner(undefined)).toBe(true);
  });

  it('respects server access.canMutate when present', () => {
    expect(canMutateOwner({
      status: SubscriptionStatus.EXPIRED,
      access: { canMutate: true, reason: SubscriptionAccessReason.TRIAL_EXPIRED },
    })).toBe(true);
    expect(canMutateOwner({
      status: SubscriptionStatus.TRIALING,
      access: { canMutate: false, reason: SubscriptionAccessReason.TRIAL_EXPIRED },
    })).toBe(false);
  });

  it('blocks mutate for expired and canceled statuses', () => {
    expect(canMutateOwner({ status: SubscriptionStatus.EXPIRED })).toBe(false);
    expect(canMutateOwner({ status: SubscriptionStatus.CANCELED })).toBe(false);
    expect(canMutateOwner({ status: SubscriptionStatus.ACTIVE })).toBe(true);
    expect(canMutateOwner({ status: SubscriptionStatus.PAST_DUE })).toBe(true);
  });

  it('computes days remaining from trialEndsAt', () => {
    const trialEndsAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysRemaining({ trialEndsAt, status: SubscriptionStatus.TRIALING })).toBeGreaterThanOrEqual(5);
    expect(daysRemaining({ daysRemaining: 12 })).toBe(12);
  });

  it('marks expired when trial end is in the past', () => {
    expect(isExpired({
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() - 86400000).toISOString(),
    })).toBe(true);
  });

  it('derives access reasons for trial ending and expired', () => {
    const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(accessReason({
      status: SubscriptionStatus.TRIALING,
      planCode: PlanCode.TRIAL,
      trialEndsAt: soon,
    })).toBe(SubscriptionAccessReason.TRIAL_ENDING);

    expect(accessReason({ status: SubscriptionStatus.EXPIRED })).toBe(SubscriptionAccessReason.TRIAL_EXPIRED);
    expect(accessReason({
      status: SubscriptionStatus.ACTIVE,
      planCode: PlanCode.GROWTH,
    })).toBe(SubscriptionAccessReason.SUBSCRIBED);
  });

  it('reports trial progress against 90 days', () => {
    const progress = trialProgress({
      status: SubscriptionStatus.TRIALING,
      planCode: PlanCode.TRIAL,
      daysRemaining: 60,
    });
    expect(progress).toEqual({ remaining: 60, used: 30, total: 90, percent: 33 });
  });

  it('identifies mutate paths that need an active subscription', () => {
    expect(isOwnerMutatePath('/owner/venues/new')).toBe(true);
    expect(isOwnerMutatePath('/owner/venues/v1/calendar')).toBe(true);
    expect(isOwnerMutatePath('/owner/venues/v1/courts')).toBe(true);
    expect(isOwnerMutatePath('/owner/venues/v1/edit')).toBe(true);
    expect(isOwnerMutatePath('/owner/venues/v1/booking-policy')).toBe(true);
    expect(isOwnerMutatePath('/owner')).toBe(false);
    expect(isOwnerMutatePath('/owner/billing')).toBe(false);
    expect(isOwnerMutatePath('/owner/earnings')).toBe(false);
  });

  it('falls back to catalog placeholders and strips trial', () => {
    expect(resolvePlans([])).toEqual(FALLBACK_SUBSCRIPTION_PLANS);
    expect(resolvePlans([{ code: PlanCode.TRIAL, name: 'Trial' }])).toEqual(FALLBACK_SUBSCRIPTION_PLANS);
    expect(resolvePlans([
      { code: PlanCode.PRO, name: 'Pro', sortOrder: 2 },
      { code: PlanCode.STARTER, name: 'Starter', sortOrder: 1 },
    ]).map((p) => p.code)).toEqual([PlanCode.STARTER, PlanCode.PRO]);
  });

  it('formats plan display names', () => {
    expect(planDisplayName(PlanCode.TRIAL)).toBe('Free trial');
    expect(planDisplayName(PlanCode.GROWTH)).toBe('Growth');
  });

  it('resolves plan limits from subscription or fallback by plan code', () => {
    expect(resolvePlanLimits({ planCode: PlanCode.STARTER }).maxVenues).toBe(1);
    expect(resolvePlanLimits({ planCode: PlanCode.STARTER }).reportsEnabled).toBe(false);
    expect(resolvePlanLimits({
      planCode: PlanCode.STARTER,
      limits: {
        maxVenues: 3,
        reportsEnabled: true,
        calendarEnabled: true,
        walkInEnabled: true,
        earningsEnabled: true,
        advancedReportsEnabled: false,
      },
    }).maxVenues).toBe(3);
    expect(formatLimitCount(null)).toBe('Unlimited');
    expect(formatLimitCount(5)).toBe('5');
  });

  it('gates venue and court creation by limits', () => {
    const starter = {
      status: SubscriptionStatus.ACTIVE,
      planCode: PlanCode.STARTER,
      limits: {
        maxVenues: 1,
        maxCourtsPerVenue: 2,
        calendarEnabled: true,
        walkInEnabled: true,
        earningsEnabled: true,
        reportsEnabled: false,
        advancedReportsEnabled: false,
      },
      usage: { venueCount: 1 },
    };
    expect(canCreateVenue(starter, 1)).toBe(false);
    expect(canCreateVenue({ ...starter, usage: { venueCount: 0 } }, 0)).toBe(true);
    expect(canCreateCourt(starter, 2)).toBe(false);
    expect(canCreateCourt(starter, 1)).toBe(true);
  });

  it('gates reports and long ranges', () => {
    const growth = {
      status: SubscriptionStatus.ACTIVE,
      planCode: PlanCode.GROWTH,
      limits: {
        maxVenues: 5,
        reportsEnabled: true,
        advancedReportsEnabled: false,
        calendarEnabled: true,
        walkInEnabled: true,
        earningsEnabled: true,
      },
    };
    expect(canUseReports(growth)).toBe(true);
    expect(canUseAdvancedReports(growth)).toBe(false);
    expect(canUseReportRange(growth, '2026-01-01', '2026-01-30')).toBe(true);
    expect(canUseReportRange(growth, '2026-01-01', '2026-02-15')).toBe(false);
  });

  it('detects PLAN_LIMIT API errors', () => {
    const error = {
      response: {
        status: 403,
        data: { code: ApiErrorCode.PLAN_LIMIT, message: 'Upgrade to add more.' },
      },
    };
    expect(isPlanLimitError(error)).toBe(true);
    expect(planLimitMessage(error)).toBe('Upgrade to add more.');
    expect(isPlanLimitError({ response: { status: 403, data: { code: 'FORBIDDEN' } } })).toBe(false);
  });

  it('includes commission defaults on fallback plans', () => {
    expect(resolvePlanLimits({ planCode: PlanCode.TRIAL }).commissionPercent).toBe(0);
    expect(resolvePlanLimits({ planCode: PlanCode.STARTER }).commissionPercent).toBe(10);
    expect(FALLBACK_SUBSCRIPTION_PLANS.find((p) => p.code === PlanCode.STARTER)?.commissionPercent).toBe(10);
  });

  it('resolves staff seat limits by plan', () => {
    expect(resolvePlanLimits({ planCode: PlanCode.STARTER }).maxStaff).toBe(1);
    expect(resolvePlanLimits({ planCode: PlanCode.GROWTH }).maxStaff).toBe(5);
    expect(resolvePlanLimits({ planCode: PlanCode.PRO }).maxStaff).toBeNull();
  });
});
