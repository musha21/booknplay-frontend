import { useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Chip, MenuItem, Skeleton, TextField } from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import EarningsTrendChart from '../../components/owner/EarningsTrendChart';
import SubscriptionRequiredPanel from '../../components/owner/SubscriptionRequiredPanel';
import {
  OwnerPage,
  OwnerPageHeader,
  OwnerSection,
  OwnerStatRow,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
import {
  useOwnerEarnings,
  useOwnerSports,
  useOwnerSubscription,
  useOwnerVenues,
} from '../../hooks/useOwner';
import {
  REPORT_RANGE_OPTIONS,
  REPORT_RANGE_PRESETS,
  buildEarningsCsv,
  buildReportExportFilename,
  downloadCsv,
  formatReportLkr,
  normalizeBySportRows,
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

const dailyColumns = [
  { key: 'date', label: 'Date', emphasize: true },
  { key: 'bookingCount', label: 'Bookings' },
  { key: 'gross', label: 'Gross', render: (row) => `LKR ${formatReportLkr(row.gross)}` },
  { key: 'commission', label: 'Commission', render: (row) => `LKR ${formatReportLkr(row.commission)}` },
  { key: 'net', label: 'Net', emphasize: true, render: (row) => `LKR ${formatReportLkr(row.net)}` },
];

const sportColumns = [
  { key: 'sportName', label: 'Sport', emphasize: true },
  { key: 'bookingCount', label: 'Bookings' },
  { key: 'gross', label: 'Gross', render: (row) => `LKR ${formatReportLkr(row.gross)}` },
  { key: 'commission', label: 'Commission', render: (row) => `LKR ${formatReportLkr(row.commission)}` },
  { key: 'net', label: 'Net', emphasize: true, render: (row) => `LKR ${formatReportLkr(row.net)}` },
];

function reportsSectionPath(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/owner/reports';
  const match = SUBNAV.find((item) => (
    item.end
      ? path === item.to
      : path === item.to || path.startsWith(`${item.to}/`)
  ));
  return match?.to || SUBNAV[0].to;
}

function ReportsShell({
  children,
  range,
  preset,
  setPreset,
  customFrom,
  customTo,
  onCustomFrom,
  onCustomTo,
  sportId,
  setSportId,
  venueId,
  setVenueId,
  sports,
  venues,
  onDownload,
  canDownload,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const sectionPath = reportsSectionPath(pathname);

  return (
    <OwnerPage className="max-w-6xl">
      <OwnerPageHeader
        eyebrow="Insights"
        title="Reports"
        description={`Analytics from ${range.from} to ${range.to}.`}
        actions={(
          <Button variant="outlined" startIcon={<Download />} disabled={!canDownload} onClick={onDownload} className="!min-h-11">
            Download CSV
          </Button>
        )}
      />
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <TextField
            select
            label="Reports section"
            size="small"
            value={sectionPath}
            onChange={(event) => navigate(event.target.value)}
            fullWidth
            className="lg:!hidden"
            SelectProps={{ 'aria-label': 'Reports sections' }}
          >
            {SUBNAV.map((item) => (
              <MenuItem key={item.to} value={item.to}>{item.label}</MenuItem>
            ))}
          </TextField>
          <nav className="hidden flex-col gap-2 lg:flex" aria-label="Reports sections">
            {SUBNAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `min-h-11 rounded-xl px-4 py-2.5 text-sm font-extrabold ${
                  isActive ? 'bg-navy-900 text-white dark:bg-lime-400 dark:text-navy-900' : 'text-muted hover:bg-canvas'
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">Range</p>
              <div className="flex flex-wrap gap-2">
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
                <Chip
                  clickable
                  size="small"
                  color={preset === REPORT_RANGE_PRESETS.CUSTOM ? 'secondary' : 'default'}
                  label="Custom"
                  onClick={() => setPreset(REPORT_RANGE_PRESETS.CUSTOM)}
                />
              </div>
            </div>

            {preset === REPORT_RANGE_PRESETS.CUSTOM ? (
              <div className="grid gap-3">
                <TextField
                  type="date"
                  label="From"
                  size="small"
                  value={customFrom}
                  onChange={(event) => onCustomFrom(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="date"
                  label="To"
                  size="small"
                  value={customTo}
                  onChange={(event) => onCustomTo(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </div>
            ) : null}

            <TextField
              select
              label="Sport"
              size="small"
              value={sportId}
              onChange={(event) => setSportId(event.target.value)}
              fullWidth
            >
              <MenuItem value="">All sports</MenuItem>
              {sports.map((sport) => (
                <MenuItem key={sport.sportId} value={sport.sportId}>
                  {sport.sportName || sport.sportId}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Venue"
              size="small"
              value={venueId}
              onChange={(event) => setVenueId(event.target.value)}
              fullWidth
            >
              <MenuItem value="">All venues</MenuItem>
              {venues.map((venue) => (
                <MenuItem key={venue.id} value={venue.id}>
                  {venue.name || venue.id}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </OwnerPage>
  );
}

export default function OwnerReportsPage() {
  const location = useLocation();
  const defaultRange = useMemo(() => reportRangeDates(REPORT_RANGE_PRESETS.LAST_30_DAYS), []);
  const [preset, setPreset] = useState(REPORT_RANGE_PRESETS.LAST_30_DAYS);
  const [customFrom, setCustomFrom] = useState(defaultRange.from);
  const [customTo, setCustomTo] = useState(defaultRange.to);
  const [sportId, setSportId] = useState('');
  const [venueId, setVenueId] = useState('');

  const range = useMemo(() => {
    if (preset === REPORT_RANGE_PRESETS.CUSTOM) {
      return { from: customFrom, to: customTo };
    }
    return reportRangeDates(preset);
  }, [preset, customFrom, customTo]);

  const customRangeValid = Boolean(range.from && range.to && range.from <= range.to);

  const handlePreset = (next) => {
    setPreset(next);
    if (next !== REPORT_RANGE_PRESETS.CUSTOM) {
      const nextRange = reportRangeDates(next);
      setCustomFrom(nextRange.from);
      setCustomTo(nextRange.to);
    }
  };

  const subscriptionsEnabled = isOwnerSubscriptionsEnabled();
  const { data: subscription } = useOwnerSubscription({ enabled: subscriptionsEnabled });
  const reportsAllowed = !subscriptionsEnabled || canUseReports(subscription);
  const advancedAllowed = !subscriptionsEnabled || canUseAdvancedReports(subscription);
  const rangeAllowed = customRangeValid
    && (!subscriptionsEnabled || canUseReportRange(subscription, range.from, range.to));

  const sportsQuery = useOwnerSports({ enabled: reportsAllowed });
  const venuesQuery = useOwnerVenues(false);
  const sports = Array.isArray(sportsQuery.data) ? sportsQuery.data : [];
  const venues = Array.isArray(venuesQuery.data) ? venuesQuery.data : [];

  const summaryQuery = useOwnerEarnings(range.from, range.to, {
    view: 'reports',
    sportId: sportId || undefined,
    venueId: venueId || undefined,
    enabled: reportsAllowed && rangeAllowed && customRangeValid,
  });
  const summary = summaryQuery.data;
  const daily = normalizeDailyRows(summary);
  const bySport = normalizeBySportRows(summary);
  const section = location.pathname.replace(/\/$/, '');

  const selectedSport = sports.find((sport) => sport.sportId === sportId);
  const selectedVenue = venues.find((venue) => venue.id === venueId);

  const handleDownload = () => {
    downloadCsv(
      buildReportExportFilename({ from: range.from, to: range.to, sportId, venueId }),
      buildEarningsCsv(daily, {
        from: range.from,
        to: range.to,
        sportId: sportId || undefined,
        sportName: selectedSport?.sportName,
        venueId: venueId || undefined,
        venueName: selectedVenue?.name,
      }),
    );
  };

  if (subscriptionsEnabled && subscription && !reportsAllowed) {
    return (
      <SubscriptionRequiredPanel
        title="Reports need a higher plan"
        description="Upgrade to Growth or Pro to unlock the reports workspace."
      />
    );
  }

  const body = !customRangeValid ? (
    <Alert severity="warning">Choose a valid custom date range (from must be on or before to).</Alert>
  ) : !rangeAllowed ? (
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
            <OwnerResponsiveRows
              rows={[
                { key: 'net', share: 'Net to venue', amount: `LKR ${formatReportLkr(summary?.net)}` },
                { key: 'commission', share: 'Platform commission', amount: `LKR ${formatReportLkr(summary?.commission)}` },
              ]}
              getRowKey={(row) => row.key}
              columns={[
                { key: 'share', label: 'Share', emphasize: true },
                { key: 'amount', label: 'Amount' },
              ]}
            />
          </OwnerSection>
          <OwnerSection className="mt-8">
            <h2 className="text-lg font-black text-ink">By sport</h2>
            <p className="mt-1 text-sm text-muted">Booking volume and earnings split across sports in this range.</p>
            <div className="mt-4">
              <OwnerResponsiveRows
                rows={bySport}
                getRowKey={(row) => row.sportId || row.sportName}
                emptyMessage="No sport breakdown for this range."
                columns={sportColumns}
              />
            </div>
          </OwnerSection>
        </>
      )}

      {section.endsWith('/trends') && (
        <OwnerSection>
          <h2 className="text-lg font-black text-ink">Trends</h2>
          <p className="mt-1 text-sm text-muted">Daily bookings (bars) and net earnings (line).</p>
          <div className="mt-4">
            <EarningsTrendChart summary={summary} />
          </div>
        </OwnerSection>
      )}

      {section.endsWith('/daily') && (
        <OwnerResponsiveRows
          rows={daily}
          getRowKey={(row) => row.date}
          emptyMessage="No daily rows for this range."
          columns={dailyColumns}
        />
      )}

      {section.endsWith('/export') && (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-black text-ink">Export</h2>
          <p className="mt-2 text-sm text-muted">
            Download the current filtered range as CSV for spreadsheets.
            {sportId || venueId ? ' Active sport/venue filters are noted in the file header.' : ''}
          </p>
          <Button className="!mt-4 !min-h-11" variant="contained" color="secondary" startIcon={<Download />} disabled={daily.length === 0} onClick={handleDownload}>
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
      setPreset={handlePreset}
      customFrom={customFrom}
      customTo={customTo}
      onCustomFrom={(value) => {
        setCustomFrom(value);
        setPreset(REPORT_RANGE_PRESETS.CUSTOM);
      }}
      onCustomTo={(value) => {
        setCustomTo(value);
        setPreset(REPORT_RANGE_PRESETS.CUSTOM);
      }}
      sportId={sportId}
      setSportId={setSportId}
      venueId={venueId}
      setVenueId={setVenueId}
      sports={sports}
      venues={venues}
      onDownload={handleDownload}
      canDownload={daily.length > 0 && !summaryQuery.isLoading && rangeAllowed && customRangeValid}
    >
      {body}
    </ReportsShell>
  );
}
