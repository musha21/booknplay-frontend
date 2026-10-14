import dayjs from 'dayjs';
import { Skeleton, Tooltip } from '@mui/material';
import { ContentCopy, Refresh } from '@mui/icons-material';
import { toast } from 'sonner';
import { OwnerDialog, OwnerStatusBadge } from './OwnerDashboardUi';
import { useOwnerPayoutDetail } from '../../hooks/useOwner';
import { formatCurrency } from '../../utils/formatters';

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

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY') : String(value);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY, HH:mm') : String(value);
};

const statusMeta = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'PAID':
      return { label: 'Paid', tone: 'live' };
    case 'PROCESSING':
      return { label: 'Processing', tone: 'info' };
    case 'ON_HOLD':
      return { label: 'On hold', tone: 'warn' };
    default:
      return { label: 'Pending', tone: 'neutral' };
  }
};

const frequencyLabel = (frequency) => {
  const value = String(frequency || '').toUpperCase();
  if (value === 'MONTHLY') return 'Monthly settlement';
  if (value === 'WEEKLY') return 'Weekly settlement';
  return value ? `${value.charAt(0)}${value.slice(1).toLowerCase()} settlement` : null;
};

const shortId = (id, keep = 13) => {
  if (!id) return '—';
  if (id.length <= keep + 1) return id;
  return `${id.slice(0, keep)}…`;
};

async function copyText(value, successMessage) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error('Could not copy');
  }
}

function CopyableId({ value, label = 'Copy', ariaLabel, successMessage }) {
  if (!value) return <span className="text-muted">—</span>;
  return (
    <div className="flex min-w-0 max-w-full items-center gap-1.5">
      <Tooltip title={value}>
        <span className="min-w-0 truncate font-mono text-[13px] font-semibold text-ink">
          {shortId(value)}
        </span>
      </Tooltip>
      <Tooltip title={label}>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-navy-50 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500 dark:hover:bg-navy-800 dark:hover:text-lime-300"
          aria-label={ariaLabel || label}
          onClick={() => copyText(value, successMessage || 'Copied')}
        >
          <ContentCopy sx={{ fontSize: 15 }} />
        </button>
      </Tooltip>
    </div>
  );
}

function Money({ value, className = '' }) {
  return (
    <span className={`whitespace-nowrap ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatCurrency(value)}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
      <div className="space-y-2">
        <Skeleton variant="rounded" height={28} className="!max-w-[240px] !rounded-lg" />
        <Skeleton variant="rounded" height={18} className="!max-w-[200px] !rounded-lg" />
      </div>
      <Skeleton variant="rounded" height={180} className="!rounded-2xl" />
      <Skeleton variant="rounded" height={148} className="!rounded-2xl" />
      <Skeleton variant="rounded" height={280} className="!rounded-2xl" />
    </div>
  );
}

function SettlementSummary({ detail }) {
  const gatewayFees = Number(detail.gatewayFees || 0);
  return (
    <section className="surface-card border-l-4 border-l-navy-900 p-5 sm:p-6 dark:border-l-lime-400">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Net payout</p>
      <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] text-navy-900 dark:text-lime-300 sm:text-4xl">
        <Money value={detail.net} />
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 sm:gap-6">
        {[
          { label: 'Gross', value: detail.gross },
          { label: 'Refunds', value: detail.refundsTotal },
          { label: 'Commission', value: detail.commission },
        ].map((metric) => (
          <div key={metric.label} className="min-w-0">
            <p className="text-[12px] font-medium text-muted sm:text-[13px]">{metric.label}</p>
            <p className="mt-1.5 text-sm font-semibold text-ink sm:text-base">
              <Money value={metric.value} />
            </p>
          </div>
        ))}
      </div>

      {gatewayFees > 0 ? (
        <p className="mt-4 text-[13px] text-muted">
          Gateway fees: <Money className="font-semibold text-ink" value={gatewayFees} />
        </p>
      ) : null}

      {detail.note ? (
        <div className="mt-4 rounded-xl border border-line bg-canvas/60 px-3 py-2.5 sm:px-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Note</p>
          <p className="mt-1 break-words text-sm text-ink">{detail.note}</p>
        </div>
      ) : null}
    </section>
  );
}

function TransferDetails({ detail }) {
  const fields = [
    {
      key: 'ref',
      label: 'Reference',
      node: detail.transferReference ? (
        <CopyableId
          value={detail.transferReference}
          label="Copy reference"
          ariaLabel="Copy reference"
          successMessage="Transfer reference copied"
        />
      ) : null,
    },
    {
      key: 'date',
      label: 'Transfer date',
      node: detail.transferDate ? formatDate(detail.transferDate) : null,
    },
    {
      key: 'amount',
      label: 'Transfer amount',
      node: detail.transferAmount != null ? <Money value={detail.transferAmount} /> : null,
    },
    {
      key: 'paidAt',
      label: 'Paid at',
      node: detail.paidAt ? formatDateTime(detail.paidAt) : null,
    },
  ].filter((field) => field.node != null);

  if (!fields.length) return null;

  return (
    <section className="surface-card p-5 sm:p-6">
      <h3 className="text-base font-bold text-navy-900 dark:text-ink sm:text-lg">Transfer details</h3>
      <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="min-w-0">
            <dt className="text-[13px] font-medium text-muted">{field.label}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-ink sm:text-base">{field.node}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SettlementBookings({ items }) {
  return (
    <section className="surface-card overflow-hidden p-0">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line bg-navy-50/80 px-5 py-4 sm:px-6 sm:py-5 dark:bg-navy-900/40">
        <h3 className="text-base font-bold text-navy-900 dark:text-ink sm:text-lg">Bookings</h3>
        <p className="rounded-full bg-lime-100 px-2.5 py-1 text-[12px] font-bold text-navy-900 dark:bg-lime-900/30 dark:text-lime-200">
          {items.length} {items.length === 1 ? 'booking' : 'bookings'}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted sm:px-6">
          No bookings in this settlement.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-canvas text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
                  <th className="min-w-[200px] px-5 py-3.5 font-semibold sm:px-6">Booking</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Gross</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Refund</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Commission</th>
                  <th className="px-5 py-3.5 text-right font-semibold sm:px-6">Net</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-line last:border-b-0 transition hover:bg-navy-50/50 dark:hover:bg-navy-900/30"
                  >
                    <td className="min-w-[200px] px-5 py-3.5 align-middle sm:px-6">
                      <div className="flex min-w-0 items-center gap-2">
                        <CopyableId
                          value={item.bookingId}
                          label="Copy booking id"
                          ariaLabel="Copy booking id"
                          successMessage="Booking id copied"
                        />
                        {item.adjustment ? (
                          <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                            Adj
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle text-muted">
                      <Money value={item.gross} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle text-muted">
                      <Money value={item.refund} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle text-muted">
                      <Money value={item.commission} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right align-middle font-semibold text-navy-900 dark:text-ink sm:px-6">
                      <Money value={item.net} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line md:hidden">
            {items.map((item) => (
              <li key={item.id} className="space-y-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-muted">Booking</p>
                  <div className="mt-1 flex min-w-0 items-center gap-2">
                    <CopyableId
                      value={item.bookingId}
                      label="Copy booking id"
                      ariaLabel="Copy booking id"
                      successMessage="Booking id copied"
                    />
                    {item.adjustment ? (
                      <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        Adj
                      </span>
                    ) : null}
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Gross', value: item.gross },
                    { label: 'Refund', value: item.refund },
                    { label: 'Commission', value: item.commission },
                    { label: 'Net', value: item.net, strong: true },
                  ].map((row) => (
                    <div key={row.label} className="min-w-0">
                      <dt className="text-[12px] font-medium text-muted">{row.label}</dt>
                      <dd className={`mt-0.5 ${row.strong ? 'font-bold text-navy-900 dark:text-ink' : 'font-semibold text-ink'}`}>
                        <Money value={row.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/**
 * @param {{ open: boolean, onClose: () => void, payoutId: string | null }} props
 */
export default function SettlementBreakdownDialog({ open, onClose, payoutId }) {
  const detailQuery = useOwnerPayoutDetail(payoutId, { enabled: open && Boolean(payoutId) });
  const detail = detailQuery.data;

  const status = statusMeta(detail?.status);
  const frequency = frequencyLabel(detail?.frequency);
  const items = Array.isArray(detail?.items) ? detail.items : [];
  const isPaid = String(detail?.status || '').toUpperCase() === 'PAID';
  const hasTransferMeta = Boolean(
    detail?.transferReference || detail?.transferDate || detail?.transferAmount != null || detail?.paidAt,
  );

  return (
    <OwnerDialog
      open={open}
      onClose={onClose}
      title="Settlement breakdown"
      fullScreenMobile
      fullScreenBreakpoint="md"
      maxWidth="lg"
      actions={(
        <button type="button" className="btn-outline min-h-11 w-full sm:w-auto" onClick={onClose}>
          Close
        </button>
      )}
    >
      {detailQuery.isLoading ? (
        <LoadingSkeleton />
      ) : detailQuery.isError ? (
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 py-10 text-center">
          <p className="text-base font-bold text-ink">Could not load this settlement.</p>
          <p className="text-sm text-muted">Check your connection and try again.</p>
          <button
            type="button"
            className="btn-outline inline-flex min-h-11 items-center justify-center gap-2"
            onClick={() => detailQuery.refetch()}
          >
            <Refresh fontSize="small" /> Retry
          </button>
        </div>
      ) : detail ? (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-2 sm:gap-8">
          <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 sm:hidden">
                <OwnerStatusBadge tone={status.tone}>{status.label}</OwnerStatusBadge>
              </div>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-navy-900 dark:text-ink sm:text-[28px]">
                Settlement breakdown
              </h2>
              <p className="mt-2 text-sm font-medium text-muted sm:text-[15px]">
                {formatPeriod(detail.periodStart, detail.periodEnd)}
              </p>
              {frequency ? (
                <p className="mt-1 text-[13px] text-muted">{frequency}</p>
              ) : null}
            </div>
            <div className="hidden shrink-0 sm:block">
              <OwnerStatusBadge tone={status.tone}>{status.label}</OwnerStatusBadge>
            </div>
          </header>

          <SettlementSummary detail={detail} />

          {isPaid && hasTransferMeta ? <TransferDetails detail={detail} /> : null}

          <SettlementBookings items={items} />
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted">No settlement selected.</p>
      )}
    </OwnerDialog>
  );
}
