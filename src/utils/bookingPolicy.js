export const ADVANCE_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
};

export const BALANCE_COLLECTION = {
  AT_VENUE: 'AT_VENUE',
  ONLINE_BEFORE_START: 'ONLINE_BEFORE_START',
};

export const REFUND_BASES = {
  AMOUNT_PAID: 'AMOUNT_PAID',
  ADVANCE_PAID: 'ADVANCE_PAID',
  NONE: 'NONE',
};

export const FEE_TYPES = {
  NONE: 'NONE',
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
};

/** Fixed product rule: cancel within 1 hour of booking for a full refund. */
export const FIXED_CANCEL_HOURS_AFTER_BOOKING = 1;

const FULL_REFUND_RULE = {
  refundBase: REFUND_BASES.AMOUNT_PAID,
  feeType: FEE_TYPES.NONE,
  feeValue: 0,
};

const NO_REFUND_RULE = {
  refundBase: REFUND_BASES.NONE,
  feeType: FEE_TYPES.NONE,
  feeValue: 0,
};

export const DEFAULT_BOOKING_POLICY = {
  version: null,
  advanceRequired: true,
  advanceType: ADVANCE_TYPES.PERCENTAGE,
  advanceValue: 100,
  balanceCollection: BALANCE_COLLECTION.ONLINE_BEFORE_START,
  cancellationAllowed: false,
  freeCancellationHours: FIXED_CANCEL_HOURS_AFTER_BOOKING,
  lateCancellationRule: { ...FULL_REFUND_RULE },
  noShowRule: { ...NO_REFUND_RULE },
};

const normalizeRule = (rule, fallback) => ({
  refundBase: rule?.refundBase || fallback.refundBase,
  feeType: rule?.feeType || fallback.feeType,
  feeValue: Number(rule?.feeValue ?? fallback.feeValue),
});

const fromCancellationApi = (policy) => {
  const hours = Number(policy.hoursBeforeDeadline ?? 0);
  const cancellationAllowed = hours > 0;
  return {
    ...DEFAULT_BOOKING_POLICY,
    cancellationAllowed,
    freeCancellationHours: FIXED_CANCEL_HOURS_AFTER_BOOKING,
    lateCancellationRule: cancellationAllowed ? { ...FULL_REFUND_RULE } : { ...NO_REFUND_RULE },
  };
};

export const normalizeBookingPolicy = (source = {}) => {
  const policy = source?.data ?? source?.policy ?? source;
  if (
    policy
    && policy.advanceRequired == null
    && (policy.hoursBeforeDeadline != null || policy.refundPercentage != null)
  ) {
    return fromCancellationApi(policy);
  }
  const cancellationAllowed = Boolean(policy?.cancellationAllowed);
  return {
    ...DEFAULT_BOOKING_POLICY,
    ...policy,
    advanceValue: Number(policy?.advanceValue ?? DEFAULT_BOOKING_POLICY.advanceValue),
    cancellationAllowed,
    freeCancellationHours: FIXED_CANCEL_HOURS_AFTER_BOOKING,
    lateCancellationRule: cancellationAllowed
      ? { ...FULL_REFUND_RULE }
      : normalizeRule(policy?.lateCancellationRule, NO_REFUND_RULE),
    noShowRule: normalizeRule(policy?.noShowRule, DEFAULT_BOOKING_POLICY.noShowRule),
  };
};

export const validateBookingPolicy = (policy) => {
  const errors = [];
  const advanceValue = Number(policy.advanceValue);

  if (policy.advanceRequired) {
    if (!Number.isFinite(advanceValue) || advanceValue <= 0) {
      errors.push('Enter an advance payment greater than zero.');
    }
    if (policy.advanceType === ADVANCE_TYPES.PERCENTAGE && advanceValue > 100) {
      errors.push('Advance percentage cannot exceed 100%.');
    }
  }

  return [...new Set(errors)];
};

/**
 * Live owner API stores only a deadline hours value and a refund percent.
 * Product lock: 1 hour after booking + 100% refund when cancel is on.
 */
export const bookingPolicyPayload = (policy) => {
  const normalized = normalizeBookingPolicy(policy);
  if (!normalized.cancellationAllowed) {
    return { hoursBeforeDeadline: 0, refundPercentage: 0 };
  }
  return {
    hoursBeforeDeadline: FIXED_CANCEL_HOURS_AFTER_BOOKING,
    refundPercentage: 100,
  };
};

export const policyExample = (policy, bookingTotal = 4000) => {
  const total = Math.max(0, Number(bookingTotal) || 0);
  let payNow = 0;
  if (policy.advanceRequired) {
    payNow = policy.advanceType === ADVANCE_TYPES.PERCENTAGE
      ? total * Math.min(100, Math.max(0, Number(policy.advanceValue) || 0)) / 100
      : Math.min(total, Math.max(0, Number(policy.advanceValue) || 0));
  }
  return { total, payNow, balanceDue: Math.max(0, total - payNow) };
};
