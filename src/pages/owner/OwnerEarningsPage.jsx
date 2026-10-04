import dayjs from 'dayjs';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@mui/material';
import { OwnerPage, OwnerPageHeader, OwnerSection, OwnerStatRow } from '../../components/owner/OwnerDashboardUi';
import { useOwnerEarnings, useOwnerPayouts } from '../../hooks/useOwner';

const formatLkr = (value) =>
  Number(value || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OwnerEarningsPage() {
  const from = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');
  const { data: summary } = useOwnerEarnings(from, to);
  const { data: payouts = [] } = useOwnerPayouts();

  return (
    <OwnerPage className="max-w-6xl">
      <OwnerPageHeader
        eyebrow="Money"
        title="Earnings"
        description={`Confirmed and completed bookings from ${from} to ${to}.`}
        actions={(
          <Button component={RouterLink} to="/owner/reports" variant="outlined">
            Open reports
          </Button>
        )}
      />

      <OwnerSection className="mt-8 border-y border-line py-8">
        <OwnerStatRow
          items={[
            { label: 'Bookings', value: summary?.bookingCount ?? 0, detail: 'In this range', emphasis: true },
            { label: 'Gross', prefix: 'LKR', value: formatLkr(summary?.gross), detail: 'Before commission', emphasis: true },
            { label: 'Commission', value: formatLkr(summary?.commission), detail: `${summary?.commissionPercent ?? 10}% platform share` },
            { label: 'Net', value: formatLkr(summary?.net), detail: 'After commission' },
            { label: 'Payouts', value: payouts.length, detail: 'Recorded transfers' },
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
              <article key={payout.id} className="surface-card p-4">
                <p className="text-sm font-extrabold text-ink">{payout.periodStart} → {payout.periodEnd}</p>
                <p className="mt-2 text-2xl font-black text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>LKR {formatLkr(payout.net)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">{payout.status}</p>
              </article>
            ))}
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
