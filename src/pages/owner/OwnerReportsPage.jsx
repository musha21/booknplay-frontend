import { useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { Alert, Button, Chip, Skeleton } from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import SubscriptionRequiredPanel from '../../components/owner/SubscriptionRequiredPanel';
import {
  OwnerPage,
  OwnerPageHeader,
  OwnerSection,
  OwnerStatRow,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerEarnings, useOwnerSubscription } from '../../hooks/useOwner';
import {
  REPORT_RANGE_OPTIONS,
  REPORT_RANGE_PRESETS,
  buildEarningsCsv,
  downloadCsv,
  formatReportLkr,
  normalizeDailyRows,
  reportRangeDates,
} from '../../utils/ownerReports';
import {
  canUseAdvancedReports,
  canUseReportRange,
  canUseReports,
  isOwnerSubscriptionsEnabled,
  isPlanLimitError,
} from '../../utils/subscription';

const SUBNAV = [
  { to: '/owner/reports', end: true, label: 'Overview' },
  { to: '/owner/reports/trends', label: 'Trends' },
  { to: '/owner/reports/daily', label: 'Daily' },
  { to: '/owner/reports/export', label: 'Export' },
];

function ReportsShell({ children, range, preset, setPreset, onDownload, canDownload }) {
  return (
    <OwnerPage className="max-w-6xl">
      <OwnerPageHeader
        eyebrow="Insights"
        title="Reports"
        description={`Analytics from ${range.from} to ${range.to}.`}
        actions={(
          <Button variant="outlined" startIcon={<Download />} disabled={!canDownload} onClick={onDownload}>
            Download CSV
          </Button>
        )}
      />
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-48">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Reports sections">
            {SUBNAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `rounded-xl px-4 py-2.5 text-sm font-extrabold ${
                  isActive ? 'bg-navy-900 text-white dark:bg-lime-400 dark:text-navy-900' : 'text-muted hover:bg-canvas'
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap gap-2">
            {REPORT_RANGE_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                clickable
                size="small"
                color={preset === option.id ? 'secondary' : 'default'}
                label={option.label}
                onClick={() => setPreset(option.id)}
              />
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </OwnerPage>
  );
}

export default function OwnerReportsPage() {
  const location = useLocation();
  const [preset, setPreset] = useState(REPORT_RANGE_PRESETS.LAST_30_DAYS);
  const range = useMemo(() => reportRangeDates(preset), [preset]);
  const subscriptionsEnabled = isOwnerSubscriptionsEnabled();
  const { data: subscription } = useOwnerSubscription({ enabled: subscriptionsEnabled });
  const reportsAllowed = !subscriptionsEnabled || canUseReports(subscription);
  const advancedAllowed = !subscriptionsEnabled || canUseAdvancedReports(subscription);
  const rangeAllowed = !subscriptionsEnabled || canUseReportRange(subscription, range.from, range.to);
  const summaryQuery = useOwnerEarnings(range.from, range.to, {
    view: 'reports',
    enabled: reportsAllowed && rangeAllowed,
  });
  const summary = summaryQuery.data;
  const daily = normalizeDailyRows(summary);
  const section = location.pathname.replace(/\/$/, '');

  const handleDownload = () => {
    downloadCsv(`booknplay-reports-${range.from}_to_${range.to}.csv`, buildEarningsCsv(daily));
  };

  if (subscriptionsEnabled && subscription && !reportsAllowed) {
    return (
      <SubscriptionRequiredPanel
        title="Reports need a higher plan"
        description="Upgrade to Growth or Pro to unlock the reports workspace."
      />
    );
  }

  const chartCategories = daily.map((row) => row.date.slice(5));
  const bookingsSeries = [{ name: 'Bookings', data: daily.map((row) => row.bookingCount) }];
  const netSeries = [{ name: 'Net LKR', data: daily.map((row) => row.net) }];

  const body = !rangeAllowed ? (
    <Alert
      severity="warning"
      action={<Button component={RouterLink} to="/owner/billing" color="inherit" size="small">Billing</Button>}
    >
      This range needs advanced reports. Choose a shorter preset or upgrade.
    </Alert>
  ) : summaryQuery.isLoading ? (
    <Skeleton variant="rounded" height={280} />
  ) : summaryQuery.isError ? (
    <Alert
      severity="error"
      action={<Button color="inherit" size="small" startIcon={<Refresh />} onClick={() => summaryQuery.refetch()}>Retry</Button>}
    >
      {isPlanLimitError(summaryQuery.error)
        ? (summaryQuery.error.response?.data?.message || 'Reports are not included in your plan.')
        : 'Reports could not be loaded.'}
    </Alert>
  ) : (
    <>
      {(section === '/owner/reports' || section.endsWith('/reports')) && (
        <>
          {!advancedAllowed && (
            <Alert severity="info" className="!mb-4" action={<Button component={RouterLink} to="/owner/billing" color="inherit" size="small">Upgrade</Button>}>
              Ranges longer than 31 days need advanced reports (Pro).
            </Alert>
          )}
          <OwnerStatRow
            items={[
              { label: 'Bookings', value: summary?.bookingCount ?? 0, detail: 'In this range', emphasis: true },
              { label: 'Gross', prefix: 'LKR', value: formatReportLkr(summary?.gross), detail: 'Before commission', emphasis: true },
              { label: 'Commission', value: formatReportLkr(summary?.commission), detail: `${summary?.commissionPercent ?? 10}% share` },
              { label: 'Net', value: formatReportLkr(summary?.net), detail: 'After commission' },
            ]}
          />
          <OwnerSection className="mt-8">
            <h2 className="text-lg font-black text-ink">Revenue mix</h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface p-3">
                <Chart
                  type="donut"
                  height={260}
                  series={[
                    Number(summary?.net || 0),
                    Number(summary?.commission || 0),
                  ]}
                  options={{
                    labels: ['Net to venue', 'Platform commission'],
                    colors: ['#0f172a', '#84cc16'],
                    legend: { position: 'bottom' },
                    chart: { toolbar: { show: false } },
                  }}
                />
              </div>
              <div className="rounded-2xl border border-line bg-surface p-3">
                <Chart
                  type="area"
                  height={260}
                  series={netSeries}
                  options={{
                    chart: { toolbar: { show: false }, zoom: { enabled: false } },
                    dataLabels: { enabled: false },
                    stroke: { curve: 'smooth', width: 2 },
                    xaxis: { categories: chartCategories },
                    colors: ['#84cc16'],
                  }}
                />
              </div>
            </div>
          </OwnerSection>
        </>
      )}

      {section.endsWith('/trends') && (
        <div className="rounded-2xl border border-line bg-surface p-3">
          <Chart
            type="bar"
            height={320}
            series={bookingsSeries}
            options={{
              chart: { toolbar: { show: false } },
              xaxis: { categories: chartCategories },
              colors: ['#0f172a'],
              plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
            }}
          />
        </div>
      )}

      {section.endsWith('/daily') && (
        daily.length === 0 ? (
          <p className="text-sm text-muted">No daily rows for this range.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
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
                {daily.map((row) => (
                  <tr key={row.date} className="border-t border-line">
                    <td className="px-4 py-3 font-bold">{row.date}</td>
                    <td className="px-4 py-3">{row.bookingCount}</td>
                    <td className="px-4 py-3">LKR {formatReportLkr(row.gross)}</td>
                    <td className="px-4 py-3">LKR {formatReportLkr(row.commission)}</td>
                    <td className="px-4 py-3 font-bold">LKR {formatReportLkr(row.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {section.endsWith('/export') && (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-black text-ink">Export</h2>
          <p className="mt-2 text-sm text-muted">Download the current range as CSV for spreadsheets.</p>
          <Button className="!mt-4" variant="contained" color="secondary" startIcon={<Download />} disabled={daily.length === 0} onClick={handleDownload}>
            Download CSV
          </Button>
        </div>
      )}
    </>
  );

  return (
    <ReportsShell
      range={range}
      preset={preset}
      setPreset={setPreset}
      onDownload={handleDownload}
      canDownload={daily.length > 0 && !summaryQuery.isLoading && rangeAllowed}
    >
      {body}
    </ReportsShell>
  );
}
