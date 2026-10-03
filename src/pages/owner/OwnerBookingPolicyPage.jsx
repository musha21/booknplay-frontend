import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Skeleton } from '@mui/material';
import { ArrowBack, Refresh, Save } from '@mui/icons-material';
import BookingPolicyForm from '../../components/owner/BookingPolicyForm';
import { OwnerPage, OwnerPageHeader } from '../../components/owner/OwnerDashboardUi';
import { useOwnerBookingPolicy, useOwnerVenue, useSaveOwnerBookingPolicy } from '../../hooks/useOwner';
import {
  DEFAULT_BOOKING_POLICY, bookingPolicyPayload, normalizeBookingPolicy,
  validateBookingPolicy,
} from '../../utils/bookingPolicy';

export default function OwnerBookingPolicyPage() {
  const { venueId } = useParams();
  const venueQuery = useOwnerVenue(venueId);
  const policyQuery = useOwnerBookingPolicy(venueId);

  return (
    <OwnerPage className="max-w-5xl">
      <OwnerPageHeader
        eyebrow="Business settings"
        title="Cancellation policy"
        description={`Turn customer cancellation on or off for all business venues. When on, customers get 1 hour from booking for a full refund. ${venueQuery.data?.name || 'This venue'} uses this policy for new bookings.`}
        actions={<Button component={Link} to="/owner" startIcon={<ArrowBack />}>Back to venues</Button>}
      />

      {policyQuery.isLoading ? (
        <div className="mt-7 space-y-4"><Skeleton variant="rounded" height={300} /><Skeleton variant="rounded" height={360} /></div>
      ) : policyQuery.isError ? (
        <Alert
          severity="error"
          className="mt-7"
          action={<Button color="inherit" size="small" startIcon={<Refresh />} onClick={() => policyQuery.refetch()}>Retry</Button>}
        >
          The venue policy could not be loaded. Saving is disabled so an existing policy cannot be overwritten accidentally.
        </Alert>
      ) : (
        <PolicyEditor
          key={policyQuery.data?.version ?? policyQuery.data?.data?.version ?? 'new'}
          venueId={venueId}
          initialPolicy={policyQuery.data}
        />
      )}
    </OwnerPage>
  );
}

function PolicyEditor({ venueId, initialPolicy }) {
  const savePolicy = useSaveOwnerBookingPolicy(venueId);
  const [policy, setPolicy] = useState(() => normalizeBookingPolicy(initialPolicy || DEFAULT_BOOKING_POLICY));
  const [showErrors, setShowErrors] = useState(false);

  const handleSave = async () => {
    setShowErrors(true);
    if (validateBookingPolicy(policy).length) return;
    try {
      const response = await savePolicy.mutateAsync(bookingPolicyPayload(policy));
      const saved = response?.data?.data ?? response?.data;
      if (saved) setPolicy(normalizeBookingPolicy(saved));
      setShowErrors(false);
    } catch {
      /* The save hook already reports the request error. */
    }
  };

  return (
    <div className="mt-7">
      <BookingPolicyForm value={policy} onChange={setPolicy} showErrors={showErrors} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-muted">
          {policy.version ? `Editing policy version ${policy.version}.` : 'This business does not have a published policy yet.'}
        </p>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Save />}
          disabled={savePolicy.isPending}
          onClick={handleSave}
        >
          {savePolicy.isPending ? 'Publishing…' : 'Publish policy'}
        </Button>
      </div>
    </div>
  );
}
