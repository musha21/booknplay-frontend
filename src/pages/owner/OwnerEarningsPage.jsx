import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Dialog, DialogContent, DialogTitle, Skeleton } from '@mui/material';
import { OwnerPage, OwnerPageHeader, OwnerSection, OwnerStatRow } from '../../components/owner/OwnerDashboardUi';
import {
  useOwnerEarnings,
  useOwnerPayoutDetail,
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

export default function OwnerEarningsPage() {
  const from = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');
  const { data: summary } = useOwnerEarnings(from, to);
  const { data: payouts = [] } = useOwnerPayouts();
  const { data: payoutSummary, isLoading: summaryLoading } = useOwnerPayoutSummary();
  const [selectedId, setSelectedId] = useState(null);
  const detailQuery = useOwnerPayoutDetail(selectedId, { enabled: Boolean(selectedId) });

  return (
    <OwnerPage className="max-w-6xl">
      <OwnerPageHeader
        eyebrow="Money"
        title="Earnings"
        description={`Confirmed online bookings from ${from} to ${to}. Walk-in cash is excluded from payouts.`}
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button component={RouterLink} to="/owner/settings" variant="outlined">
              Payout settings
            </Button>
            <Button component={RouterLink} to="/owner/reports" variant="outlined">
              Open reports
            </Button>
          </div>
        )}
      />

      <OwnerSection className="mt-8 border-y border-line py-8">
        {summaryLoading ? (
          <Skeleton variant="rounded" height={96} className="!rounded-2xl" />
        ) : (
          <OwnerStatRow
            items={[
              {
                label: 'Outstanding',
                prefix: 'LKR',
                value: formatLkr(payoutSummary?.outstandingBalance),
                detail: 'Pending / processing / on hold',
                emphasis: true,
              },
              {
                label: 'Upcoming window',
                value: payoutSummary
                  ? `${payoutSummary.upcomingPeriodStart} → ${payoutSummary.upcomingPeriodEnd}`
                  : '—',
                detail: payoutSummary?.payoutFrequency === 'MONTHLY' ? 'Monthly' : 'Weekly',
              },
              {
                label: 'Bank',
                value: payoutSummary?.bankAccountNumberMasked || '—',
                detail: payoutSummary?.bankName || 'Add bank in settings',
              },
              {
                label: 'Verification',
                value: verificationLabel(payoutSummary?.bankVerificationStatus),
                detail: payoutSummary?.bankAccountName || '—',
              },
            ]}
          />
        )}
      </OwnerSection>

      <OwnerSection className="mt-8 border-y border-line py-8">
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
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-line md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Gross</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Net</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.daily || []).map((row) => (
                <tr key={row.date} className="border-t border-line">
                  <td className="px-4 py-3 font-bold text-ink">{row.date}</td>
                  <td className="px-4 py-3 text-muted">{row.bookingCount}</td>
                  <td className="px-4 py-3 text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>LKR {formatLkr(row.gross)}</td>
                  <td className="px-4 py-3 text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>LKR {formatLkr(row.commission)}</td>
                  <td className="px-4 py-3 font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>LKR {formatLkr(row.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-3 md:hidden">
          {(summary?.daily || []).map((row) => (
            <article key={row.date} className="surface-card p-4">
              <p className="text-sm font-extrabold text-ink">{row.date}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted">Bookings</dt><dd className="font-bold text-ink">{row.bookingCount}</dd></div>
                <div><dt className="text-muted">Gross</dt><dd className="font-bold text-ink">LKR {formatLkr(row.gross)}</dd></div>
                <div><dt className="text-muted">Commission</dt><dd className="font-bold text-ink">LKR {formatLkr(row.commission)}</dd></div>
                <div><dt className="text-muted">Net</dt><dd className="font-bold text-ink">LKR {formatLkr(row.net)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
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
                className="surface-card p-4 text-left transition hover:border-ink/30"
                onClick={() => setSelectedId(payout.id)}
              >
                <p className="text-sm font-extrabold text-ink">{payout.periodStart} → {payout.periodEnd}</p>
                <p className="mt-2 text-2xl font-black text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  LKR {formatLkr(payout.net)}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">{statusLabel(payout.status)}</p>
                <p className="mt-2 text-xs text-muted">
                  Gross {formatLkr(payout.gross)} · Refunds {formatLkr(payout.refundsTotal)} · Commission {formatLkr(payout.commission)}
                </p>
              </button>
            ))}
          </div>
        )}
      </OwnerSection>

      <Dialog open={Boolean(selectedId)} onClose={() => setSelectedId(null)} fullWidth maxWidth="md">
        <DialogTitle>Settlement breakdown</DialogTitle>
        <DialogContent dividers>
          {detailQuery.isLoading ? (
            <Skeleton variant="rounded" height={180} />
          ) : detailQuery.data ? (
            <div className="space-y-4 pb-2">
              <p className="text-sm text-muted">
                {detailQuery.data.periodStart} → {detailQuery.data.periodEnd} · {statusLabel(detailQuery.data.status)}
              </p>
              <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div><dt className="text-muted">Gross</dt><dd className="font-bold">LKR {formatLkr(detailQuery.data.gross)}</dd></div>
                <div><dt className="text-muted">Refunds</dt><dd className="font-bold">LKR {formatLkr(detailQuery.data.refundsTotal)}</dd></div>
                <div><dt className="text-muted">Commission</dt><dd className="font-bold">LKR {formatLkr(detailQuery.data.commission)}</dd></div>
                <div><dt className="text-muted">Net payout</dt><dd className="font-black">LKR {formatLkr(detailQuery.data.net)}</dd></div>
              </dl>
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-3 py-2">Booking</th>
                      <th className="px-3 py-2">Gross</th>
                      <th className="px-3 py-2">Refund</th>
                      <th className="px-3 py-2">Commission</th>
                      <th className="px-3 py-2">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailQuery.data.items || []).map((item) => (
                      <tr key={item.id} className="border-t border-line">
                        <td className="px-3 py-2 font-mono text-xs">
                          {item.bookingId?.slice(0, 8)}
                          {item.adjustment ? ' · adj' : ''}
                        </td>
                        <td className="px-3 py-2">{formatLkr(item.gross)}</td>
                        <td className="px-3 py-2">{formatLkr(item.refund)}</td>
                        <td className="px-3 py-2">{formatLkr(item.commission)}</td>
                        <td className="px-3 py-2 font-bold">{formatLkr(item.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Could not load settlement detail.</p>
          )}
        </DialogContent>
      </Dialog>
    </OwnerPage>
  );
}
