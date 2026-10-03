import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { CancelOutlined, CheckCircleOutlined, InfoOutlined } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { OwnerPage } from '../../components/owner/OwnerDashboardUi';
import { useSubscriptionPaymentStatus } from '../../hooks/useOwner';
import { classifyPaymentStatus } from '../../utils/paymentStatus';

export default function OwnerBillingReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const paymentId = params.get('paymentId') || '';

  const payment = useSubscriptionPaymentStatus(paymentId, {
    refetchInterval: (query) => (
      classifyPaymentStatus(query.state.data?.status) === 'pending' ? 3000 : false
    ),
  });

  const status = classifyPaymentStatus(payment.data?.status);
  const invalid = !String(paymentId || '').trim();
  const pending = !invalid && (payment.isLoading || payment.isFetching || status === 'pending' || (!payment.data?.status && !payment.isError));
  const confirmed = !invalid && status === 'confirmed';
  const errored = !invalid && payment.isError && !payment.isLoading;

  useEffect(() => {
    if (!confirmed) return;
    queryClient.invalidateQueries({ queryKey: ['owner', 'subscription'] });
    toast.success('Subscription activated');
  }, [confirmed, queryClient]);

  return (
    <OwnerPage className="max-w-lg">
      <section className="surface-card p-8 text-center sm:p-10" aria-live="polite">
        {invalid ? (
          <>
            <CancelOutlined className="!text-7xl !text-red-500" />
            <h1 className="mt-6 text-2xl font-black text-ink">Missing payment reference</h1>
            <p className="mt-2 text-sm text-muted">Open billing from your workspace and try again.</p>
            <Button variant="contained" color="secondary" className="!mt-7" onClick={() => navigate('/owner/billing')}>
              Back to billing
            </Button>
          </>
        ) : pending ? (
          <>
            <CircularProgress color="secondary" size={54} />
            <h1 className="mt-6 text-2xl font-black text-ink">Confirming subscription payment</h1>
            <p className="mt-2 text-sm text-muted">Waiting for PayHere confirmation. This page updates automatically.</p>
          </>
        ) : confirmed ? (
          <>
            <CheckCircleOutlined className="!text-7xl !text-green-500" />
            <p className="eyebrow mt-4">Plan active</p>
            <h1 className="mt-2 text-2xl font-black text-ink">You’re subscribed.</h1>
            <p className="mt-3 text-sm text-muted">Full owner editing is restored for this business.</p>
            <Button variant="contained" color="secondary" className="!mt-7" onClick={() => navigate('/owner/billing')}>
              View billing
            </Button>
          </>
        ) : errored ? (
          <>
            <InfoOutlined className="!text-7xl !text-amber-500" />
            <h1 className="mt-6 text-2xl font-black text-ink">Status temporarily unavailable</h1>
            <p className="mt-2 text-sm text-muted">Retry the status check or return to billing.</p>
            <div className="mt-7 flex justify-center gap-3">
              <Button variant="outlined" onClick={() => payment.refetch()}>Retry</Button>
              <Button variant="contained" color="secondary" onClick={() => navigate('/owner/billing')}>Billing</Button>
            </div>
          </>
        ) : (
          <>
            <CancelOutlined className="!text-7xl !text-red-500" />
            <p className="eyebrow mt-4 !text-red-500">Payment incomplete</p>
            <h1 className="mt-2 text-2xl font-black text-ink">Subscription was not activated.</h1>
            <p className="mt-3 text-sm text-muted">No plan change was applied for this payment state.</p>
            <Button variant="outlined" className="!mt-7" onClick={() => navigate('/owner/billing')}>
              Try again
            </Button>
          </>
        )}
      </section>
    </OwnerPage>
  );
}
