import Chart from 'react-apexcharts';
import { Business, EventNote, Payments, People, Stadium, CardMembership, Timelapse, WarningAmber } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { useAdminDashboard } from '../../hooks/useAdmin';
import { formatCurrency } from '../../utils/formatters';
import { planDisplayName } from '../../utils/subscription';

const chartTheme = {
  foreColor: '#64748b',
  fontFamily: 'inherit',
};

function KpiCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="surface-card p-5">
      <Icon className="text-lime-600" />
      <span className="mt-5 block text-sm text-muted">{label}</span>
      {loading ? <Skeleton className="!mt-1" /> : <strong className="mt-1 block text-2xl">{value}</strong>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();
  const byPlan = Array.isArray(data?.subscriptionByPlan) ? data.subscriptionByPlan : [];

  const pieSeries = byPlan.map((row) => Number(row.businessCount || 0));
  const pieLabels = byPlan.map((row) => planDisplayName(row.code) || row.name || row.code);
  const barCategories = byPlan.map((row) => planDisplayName(row.code) || row.code);
  const barSeries = [{
    name: 'Commission %',
    data: byPlan.map((row) => Number(row.commissionPercent ?? 0)),
  }];

  const platformCards = [
    [People, 'Customers', data?.customers],
    [Business, 'Businesses', data?.businesses],
    [Stadium, 'Venues', data?.venues],
    [EventNote, 'Bookings', data?.bookings],
    [Payments, 'Gross value', formatCurrency(data?.grossBookingValue || 0, 'LKR')],
  ];

  const subscriptionCards = [
    [Timelapse, 'Trials active', data?.trialingCount ?? 0],
    [CardMembership, 'Paid active', data?.activePaidCount ?? 0],
    [WarningAmber, 'Expired / canceled', data?.expiredCount ?? 0],
  ];

  return (
    <>
      <p className="eyebrow">Platform overview</p>
      <h1 className="mt-2 text-3xl font-black">Super admin dashboard</h1>

      {data?.pendingVenues > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 font-bold text-amber-900">
          {data.pendingVenues} venue{data.pendingVenues === 1 ? ' is' : 's are'} waiting for approval.
        </div>
      )}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {platformCards.map(([Icon, label, value]) => (
          <KpiCard key={label} icon={Icon} label={label} value={value} loading={isLoading} />
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-black text-ink">Subscription analytics</h2>
        <p className="mt-1 text-sm text-muted">
          Plan mix and platform commission rates configured on each subscription plan.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {subscriptionCards.map(([Icon, label, value]) => (
            <KpiCard key={label} icon={Icon} label={label} value={value} loading={isLoading} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted">Businesses by plan</h3>
            {isLoading ? (
              <Skeleton className="!mt-4" variant="rounded" height={280} />
            ) : pieSeries.every((n) => n === 0) ? (
              <p className="mt-8 text-sm text-muted">No subscription rows yet.</p>
            ) : (
              <div className="mt-2">
                <Chart
                  type="donut"
                  height={300}
                  series={pieSeries}
                  options={{
                    chart: { type: 'donut', toolbar: { show: false }, ...chartTheme },
                    labels: pieLabels,
                    legend: { position: 'bottom' },
                    dataLabels: { enabled: true },
                    colors: ['#84cc16', '#0f172a', '#38bdf8', '#f59e0b'],
                    plotOptions: {
                      pie: {
                        donut: {
                          labels: {
                            show: true,
                            total: { show: true, label: 'Businesses' },
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="surface-card p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted">Commission by plan</h3>
            {isLoading ? (
              <Skeleton className="!mt-4" variant="rounded" height={280} />
            ) : (
              <div className="mt-2">
                <Chart
                  type="bar"
                  height={300}
                  series={barSeries}
                  options={{
                    chart: { type: 'bar', toolbar: { show: false }, ...chartTheme },
                    plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
                    dataLabels: { enabled: true, formatter: (value) => `${value}%` },
                    xaxis: { categories: barCategories },
                    yaxis: {
                      max: 100,
                      labels: { formatter: (value) => `${value}%` },
                    },
                    colors: ['#0f172a'],
                    tooltip: { y: { formatter: (value) => `${value}%` } },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {!isLoading && byPlan.length > 0 && (
          <div className="surface-card mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-line bg-canvas text-xs uppercase text-muted">
                <tr>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Businesses</th>
                  <th className="p-4">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {byPlan.map((row) => (
                  <tr key={row.code}>
                    <td className="p-4 font-bold">{planDisplayName(row.code) || row.name}</td>
                    <td className="p-4">{row.businessCount}</td>
                    <td className="p-4">{Number(row.commissionPercent ?? 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
