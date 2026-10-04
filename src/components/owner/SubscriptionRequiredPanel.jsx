import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LockOutlined } from '@mui/icons-material';
import { OwnerPage, OwnerPageHeader, OwnerSection } from './OwnerDashboardUi';

export default function SubscriptionRequiredPanel({
  title = 'Subscription required',
  description = 'Your free 3-month trial has ended. Choose a plan to create venues, edit courts, manage the calendar, or update booking policy.',
}) {
  return (
    <OwnerPage className="max-w-3xl">
      <OwnerPageHeader eyebrow="Billing" title={title} description={description} />
      <OwnerSection className="mt-8 rounded-2xl border border-line bg-canvas/50 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-lime-300">
            <LockOutlined />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-muted">
              Overview and basic earnings stay available when your plan allows them. Staff inherit this business subscription status.
            </p>
            <Button
              component={RouterLink}
              to="/owner/billing"
              variant="contained"
              color="secondary"
              className="!mt-5 !font-extrabold"
            >
              Go to billing
            </Button>
          </div>
        </div>
      </OwnerSection>
    </OwnerPage>
  );
}
