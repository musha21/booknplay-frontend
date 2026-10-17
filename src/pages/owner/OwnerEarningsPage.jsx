import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Skeleton } from '@mui/material';
import {
  OwnerPage,
  OwnerPageHeader,
  OwnerSection,
  OwnerStatRow,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
import SettlementBreakdownDialog from '../../components/owner/SettlementBreakdownDialog';
import {
  useOwnerEarnings,
  useOwnerPayouts,
  useOwnerPayoutSummary,
} from '../../hooks/useOwner';

const formatLkr = (value) =>
  Number(value || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusLabel = (status) => {
  switch (status) {
    case 'PROCESSING':
      return 'Processing';
    case 'ON_HOLD':
      return 'On Hold';
    case 'PAID':
      return 'Paid';
    default:
      return 'Pending';
  }
};

const verificationLabel = (status) => {
  switch (status) {
    case 'VERIFIED':
      return 'Verified';
    case 'PENDING_REVIEW':
      return 'Pending review';
    default:
      return 'Unverified';
  }
};

const formatPeriod = (start, end) => {
  if (!start || !end) return '—';
  const from = dayjs(start);
  const to = dayjs(end);
  if (!from.isValid() || !to.isValid()) return `${start} → ${end}`;
  if (from.year() === to.year()) {
    return `${from.format('D MMM')} – ${to.format('D MMM YYYY')}`;
  }
  return `${from.format('D MMM YYYY')} – ${to.format('D MMM YYYY')}`;
};

export default function OwnerEarningsPage() {
  const from = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');
  const { data: summary } = useOwnerEarnings(from, to);
  const { data: payouts = [] } = useOwnerPayouts();
  const { data: payoutSummary, isLoading: summaryLoading } = useOwnerPayoutSummary();
  const [selectedId, setSelectedId] = useState(null);
  const daily = summary?.daily || [];

  return (
    <OwnerPage className="max-w-6xl">
      <OwnerPageHeader
        eyebrow="Money"
        title="Earnings"
        description={`Confirmed online bookings from ${from} to ${to}. Walk-in cash is excluded from payouts.`}
        actions={(
          <>
            <Button component={RouterLink} to="/owner/settings" variant="outlined">
              Payout settings
            </Button>
            <Button component={RouterLink} to="/owner/reports" variant="outlined">
              Open reports
            </Button>
          </>
        )}
      />

      <OwnerSection className="mt-8 border-y border-line py-6 sm:py-8">
        {summaryLoading ? (
          <Skeleton variant="rounded" height={96} className="!rounded-2xl" />
        ) : (
          <>
            <OwnerStatRow
              items={[
                {
                  label: 'Outstanding',
                  prefix: 'LKR',
                  value: formatLkr(payoutSummary?.outstandingBalance),
                  detail: 'Pending / processing / on hold',
                  emphasis: true,
                },
              ]}
            />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-line bg-canvas/50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Upcoming window</p>
                <p className="mt-2 break-words text-sm font-black text-ink">
                  {payoutSummary
                    ? formatPeriod(payoutSummary.upcomingPeriodStart, payoutSummary.upcomingPeriodEnd)
                    : '—'}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {payoutSummary?.payoutFrequency === 'MONTHLY' ? 'Monthly' : 'Weekly'}
                </p>
              </article>
              <article className="rounded-2xl border border-line bg-canvas/50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Bank</p>
                <p className="mt-2 break-words text-sm font-black text-ink">
                  {payoutSummary?.bankAccountNumberMasked || '—'}
                </p>
                <p className="mt-1 break-words text-xs text-muted">
                  {payoutSummary?.bankName || 'Add bank in settings'}
                </p>
              </article>
              <article className="rounded-2xl border border-line bg-canvas/50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Verification</p>
                <p className="mt-2 break-words text-sm font-black text-ink">
                  {verificationLabel(payoutSummary?.bankVerificationStatus)}
                </p>
                <p className="mt-1 break-words text-xs text-muted">
                  {payoutSummary?.bankAccountName || '—'}
                </p>
              </article>
            </div>
          </>
        )}
      </OwnerSection>

      <OwnerSection className="mt-8 border-y border-line py-6 sm:py-8">
        <OwnerStatRow
          items={[
            { label: 'Bookings', value: summary?.bookingCount ?? 0, detail: 'In this range', emphasis: true },
            { label: 'Gross', prefix: 'LKR', value: formatLkr(summary?.gross), detail: 'Before commission', emphasis: true },
            { label: 'Commission', value: formatLkr(summary?.commission), detail: `${summary?.commissionPercent ?? 10}% platform share` },
            { label: 'Net', value: formatLkr(summary?.net), detail: 'After commission' },
            { label: 'Payouts', value: payouts.length, detail: 'Recorded settlements' },
          ]}
        />
      </OwnerSection>

      <OwnerSection className="mt-8">
        <h2 className="text-xl font-black text-ink">Daily breakdown</h2>
        <OwnerResponsiveRows
          rows={daily}
          getRowKey={(row) => row.date}
          emptyMessage="No daily rows for this range."
          columns={[
            { key: 'date', label: 'Date', emphasize: true },
            { key: 'bookingCount', label: 'Bookings' },
            { key: 'gross', label: 'Gross', render: (row) => `LKR ${formatLkr(row.gross)}` },
            { key: 'commission', label: 'Commission', render: (row) => `LKR ${formatLkr(row.commission)}` },
            { key: 'net', label: 'Net', emphasize: true, render: (row) => `LKR ${formatLkr(row.net)}` },
          ]}
        />
      </OwnerSection>

      <OwnerSection className="mt-10">
        <h2 className="text-xl font-black text-ink">Payout history</h2>
        {payouts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No payouts recorded yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {payouts.map((payout) => (
              <button
                key={payout.id}
                type="button"
                className={`surface-card min-h-11 p-4 text-left transition hover:border-ink/30 ${
                  selectedId === payout.id ? 'border-navy-900 ring-1 ring-navy-900/20 dark:border-lime-400 dark:ring-lime-400/30' : ''
                }`}
                onClick={() => setSelectedId(payout.id)}
              >
                <p className="break-words text-sm font-extrabold text-ink">
                  {formatPeriod(payout.periodStart, payout.periodEnd)}
                </p>
                <p className="mt-2 text-xl font-black text-ink sm:text-2xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  LKR {formatLkr(payout.net)}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">{statusLabel(payout.status)}</p>
                <p className="mt-2 break-words text-xs text-muted">
                  Gross {formatLkr(payout.gross)} · Refunds {formatLkr(payout.refundsTotal)} · Commission {formatLkr(payout.commission)}
                </p>
              </button>
            ))}
          </div>
        )}
      </OwnerSection>

      <SettlementBreakdownDialog
        open={Boolean(selectedId)}
        payoutId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </OwnerPage>
  );
}
