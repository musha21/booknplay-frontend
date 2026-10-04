import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { SubscriptionAccessReason } from '../../constants/apiTypes';
import {
  accessReason,
  canMutateOwner,
  daysRemaining,
  isOwnerSubscriptionsEnabled,
  planDisplayName,
} from '../../utils/subscription';

export default function SubscriptionAccessBanner({ subscription }) {
  if (!isOwnerSubscriptionsEnabled() || !subscription) return null;
  if (canMutateOwner(subscription) && accessReason(subscription) !== SubscriptionAccessReason.TRIAL_ENDING) {
    return null;
  }

  const reason = accessReason(subscription);
  const remaining = daysRemaining(subscription);
  const expired = reason === SubscriptionAccessReason.TRIAL_EXPIRED || !canMutateOwner(subscription);

  const title = expired
    ? 'Your free trial has ended'
    : `Free trial ends in ${remaining ?? 'a few'} day${remaining === 1 ? '' : 's'}`;
  const body = expired
    ? 'Workspace stays view-only until you choose a plan. Earnings and reports remain available.'
    : `You are on ${planDisplayName(subscription.planCode)}. Subscribe before the trial ends to keep editing venues and calendars.`;

  return (
    <div
      className={`mb-4 flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        expired
          ? 'border-red-300/70 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100'
          : 'border-amber-300/70 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100'
      }`}
      role="status"
    >
      <div className="min-w-0">
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-0.5 text-sm opacity-90">{body}</p>
      </div>
      <Button
        component={RouterLink}
        to="/owner/billing"
        variant="contained"
        color="secondary"
        className="!shrink-0 !font-extrabold"
      >
        {expired ? 'Choose a plan' : 'View billing'}
      </Button>
    </div>
  );
}
