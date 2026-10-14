import React, { useMemo, useState } from 'react';
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField,
} from '@mui/material';
import {
  generateAdminPayouts,
  setBusinessBankVerification,
  settleAdminPayout,
  updateAdminPayoutStatus,
} from '../../api/admin';
import {
  useAdminAction,
  useAdminPayout,
  useAdminPayoutBusinesses,
  useAdminPayouts,
} from '../../hooks/useAdmin';

const formatLkr = (value) =>
  Number(value || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusChip = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'PAID') return { color: 'success', label: 'Paid' };
  if (value === 'PROCESSING') return { color: 'info', label: 'Processing' };
  if (value === 'ON_HOLD') return { color: 'warning', label: 'On hold' };
  if (value === 'PENDING') return { color: 'default', label: 'Pending' };
  return { color: 'default', label: value || '—' };
};

export default function AdminPayoutsPage() {
  const [frequency, setFrequency] = useState('');
  const [status, setStatus] = useState('');
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleForm, setSettleForm] = useState({
    transferReference: '',
    transferDate: '',
    transferAmount: '',
    note: '',
    overrideReason: '',
    receipt: null,
  });

  const businessesQuery = useAdminPayoutBusinesses();
  const payoutParams = useMemo(() => ({
    ...(frequency ? { frequency } : {}),
    ...(status ? { status } : {}),
  }), [frequency, status]);
  const payoutsQuery = useAdminPayouts(payoutParams);
  const detailQuery = useAdminPayout(selectedPayoutId);

  const verifyAction = useAdminAction(
    ({ id, payload }) => setBusinessBankVerification(id, payload),
    ['admin-payout-businesses', 'admin-payouts'],
  );
  const statusAction = useAdminAction(
    ({ id, payload }) => updateAdminPayoutStatus(id, payload),
    ['admin-payouts', 'admin-payout', 'admin-payout-businesses'],
  );
  const settleAction = useAdminAction(
    ({ id, payload }) => settleAdminPayout(id, payload),
    ['admin-payouts', 'admin-payout', 'admin-payout-businesses'],
  );
  const generateAction = useAdminAction(
    () => generateAdminPayouts(),
    ['admin-payouts', 'admin-payout-businesses'],
  );

  const businesses = businessesQuery.data || [];
  const payouts = payoutsQuery.data || [];
  const detail = detailQuery.data;

  const openSettle = (payout) => {
    setSelectedPayoutId(payout.id);
    setSettleForm({
      transferReference: '',
      transferDate: new Date().toISOString().slice(0, 10),
      transferAmount: String(payout.net ?? ''),
      note: '',
      overrideReason: '',
      receipt: null,
    });
    setSettleOpen(true);
  };

  return (
    <>
      <p className="eyebrow">Platform management</p>
      <h1 className="mt-2 text-3xl font-black">Payouts</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Weekly/Monthly is the period bucket. Refresh anytime to pull new confirmed online bookings into the
        open payout (commission from the subscription plan), then Mark paid after you transfer.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Button
          variant="contained"
          disabled={generateAction.isPending}
          onClick={() => generateAction.mutate()}
        >
          Refresh settlements
        </Button>
      </div>

      <div className="surface-card mt-7 overflow-x-auto">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-lg font-black">Businesses</h2>
          <p className="mt-1 text-xs text-muted">
            Unsettled = new online payments not yet on a payout. Outstanding = open payouts ready to transfer.
          </p>
        </div>
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-line bg-canvas text-xs uppercase text-muted">
            <tr>
              {['Business', 'Commission', 'Bank', 'Verification', 'Unsettled accrued', 'Outstanding (open)', 'Latest', 'Actions'].map((h) => (
                <th key={h} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {businesses.map((row) => (
              <tr key={row.businessId}>
                <td className="p-4">
                  <p className="font-bold text-ink">{row.businessName}</p>
                  <p className="text-xs text-muted">{row.ownerEmail}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                    {row.payoutFrequency || 'WEEKLY'}
                  </p>
                </td>
                <td className="p-4 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {Number(row.commissionPercent ?? 0).toFixed(2)}%
                </td>
                <td className="p-4">
                  <p className="font-bold text-ink">{row.bankName || 'No bank'}</p>
                  <p className="text-xs text-muted">{row.bankAccountName || '—'}</p>
                  <p className="mt-1 font-mono text-sm font-bold tracking-wide text-ink select-all">
                    {row.bankAccountNumber || row.bankAccountNumberMasked || '—'}
                  </p>
                  <p className="text-xs text-muted">{row.bankBranch ? `Branch: ${row.bankBranch}` : '—'}</p>
                </td>
                <td className="p-4">{row.bankVerificationStatus || 'UNVERIFIED'}</td>
                <td className="p-4 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  LKR {formatLkr(row.unsettledAccrued)}
                </td>
                <td className="p-4 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  LKR {formatLkr(row.outstandingBalance)}
                </td>
                <td className="p-4 text-xs">
                  {row.latestPayoutStatus
                    ? `${row.latestPayoutStatus} · LKR ${formatLkr(row.latestNet)}`
                    : '—'}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={verifyAction.isPending}
                      onClick={() => verifyAction.mutate({
                        id: row.businessId,
                        payload: { status: 'VERIFIED', reason: 'Verified in admin payouts' },
                      })}
                    >
                      Verify
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      disabled={verifyAction.isPending}
                      onClick={() => verifyAction.mutate({
                        id: row.businessId,
                        payload: { status: 'UNVERIFIED', reason: 'Unverified in admin payouts' },
                      })}
                    >
                      Unverify
                    </Button>
                    {row.latestPayoutId && (
                      <Button size="small" onClick={() => setSelectedPayoutId(row.latestPayoutId)}>
                        Open latest
                      </Button>
                    )}
                    {row.latestPayoutId
                      && row.latestPayoutStatus
                      && row.latestPayoutStatus !== 'PAID'
                      && row.latestPayoutStatus !== 'ON_HOLD' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openSettle({
                          id: row.latestPayoutId,
                          net: row.latestNet,
                        })}
                      >
                        Mark paid
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="surface-card mt-7 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-lg font-black">Settlements</h2>
          <div className="flex flex-wrap gap-2">
            <Select size="small" displayEmpty value={frequency} onChange={(e) => setFrequency(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="">All frequencies</MenuItem>
              <MenuItem value="WEEKLY">Weekly</MenuItem>
              <MenuItem value="MONTHLY">Monthly</MenuItem>
            </Select>
            <Select size="small" displayEmpty value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="ON_HOLD">On hold</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
            </Select>
          </div>
        </div>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-canvas text-xs uppercase text-muted">
            <tr>
              {['Business', 'Period', 'Frequency', 'Net', 'Status', 'Actions'].map((h) => (
                <th key={h} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {payouts.map((payout) => {
              const chip = statusChip(payout.status);
              return (
                <tr key={payout.id}>
                  <td className="p-4 font-bold">{payout.businessName}</td>
                  <td className="p-4">{payout.periodStart} → {payout.periodEnd}</td>
                  <td className="p-4">{payout.frequency}</td>
                  <td className="p-4 font-black" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    LKR {formatLkr(payout.net)}
                  </td>
                  <td className="p-4">
                    <Chip size="small" color={chip.color} label={chip.label} />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="small" onClick={() => setSelectedPayoutId(payout.id)}>Detail</Button>
                      {payout.status !== 'PAID' && payout.status !== 'ON_HOLD' && (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={statusAction.isPending}
                          onClick={() => statusAction.mutate({
                            id: payout.id,
                            payload: { status: 'PROCESSING', reason: 'Approved for transfer' },
                          })}
                        >
                          Approve
                        </Button>
                      )}
                      {payout.status !== 'PAID' && (
                        <Button
                          size="small"
                          color="warning"
                          disabled={statusAction.isPending}
                          onClick={() => statusAction.mutate({
                            id: payout.id,
                            payload: { status: 'ON_HOLD', reason: 'Held by admin' },
                          })}
                        >
                          Hold
                        </Button>
                      )}
                      {payout.status !== 'PAID' && payout.status !== 'ON_HOLD' && (
                        <Button size="small" variant="contained" onClick={() => openSettle(payout)}>
                          Mark paid
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(selectedPayoutId) && !settleOpen} onClose={() => setSelectedPayoutId(null)} fullWidth maxWidth="md">
        <DialogTitle>Settlement detail</DialogTitle>
        <DialogContent dividers>
          {detailQuery.isLoading || !detail ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                {detail.businessName} · {detail.periodStart} → {detail.periodEnd} · {detail.status}
              </p>
              {(() => {
                const bank = businesses.find((b) => b.businessId === detail.businessId);
                if (!bank) return null;
                return (
                  <div className="rounded-xl border border-line bg-canvas/60 p-3 text-sm">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Bank details (for transfer)</p>
                    <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div><dt className="text-muted">Bank</dt><dd className="font-bold">{bank.bankName || '—'}</dd></div>
                      <div><dt className="text-muted">Account name</dt><dd className="font-bold">{bank.bankAccountName || '—'}</dd></div>
                      <div>
                        <dt className="text-muted">Account number</dt>
                        <dd className="font-mono text-base font-black select-all">
                          {bank.bankAccountNumber || bank.bankAccountNumberMasked || '—'}
                        </dd>
                      </div>
                      <div><dt className="text-muted">Branch</dt><dd className="font-bold">{bank.bankBranch || '—'}</dd></div>
                    </dl>
                  </div>
                );
              })()}
              <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div><dt className="text-muted">Gross</dt><dd className="font-bold">LKR {formatLkr(detail.gross)}</dd></div>
                <div><dt className="text-muted">Refunds</dt><dd className="font-bold">LKR {formatLkr(detail.refundsTotal)}</dd></div>
                <div><dt className="text-muted">Commission</dt><dd className="font-bold">LKR {formatLkr(detail.commission)}</dd></div>
                <div><dt className="text-muted">Net</dt><dd className="font-black">LKR {formatLkr(detail.net)}</dd></div>
                {detail.transferReference && (
                  <div><dt className="text-muted">Transfer ref</dt><dd className="font-bold">{detail.transferReference}</dd></div>
                )}
              </dl>
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-canvas text-xs uppercase text-muted">
                    <tr>
                      {['Booking', 'Gross', 'Refund', 'Commission', 'Net'].map((h) => (
                        <th key={h} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items || []).map((item) => (
                      <tr key={item.id} className="border-t border-line">
                        <td className="px-3 py-2 font-mono text-xs">
                          {item.bookingId?.slice(0, 8)}{item.adjustment ? ' · adj' : ''}
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
          )}
        </DialogContent>
        <DialogActions>
          {detail && detail.status !== 'PAID' && detail.status !== 'ON_HOLD' && (
            <Button variant="contained" onClick={() => openSettle(detail)}>Mark paid</Button>
          )}
          <Button onClick={() => setSelectedPayoutId(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={settleOpen} onClose={() => setSettleOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Record bank transfer</DialogTitle>
        <DialogContent className="!space-y-3 pt-2">
          {(() => {
            const bank = businesses.find((b) => b.latestPayoutId === selectedPayoutId)
              || businesses.find((b) => detail?.businessId && b.businessId === detail.businessId);
            if (!bank?.bankAccountNumber && !bank?.bankName) return null;
            return (
              <div className="rounded-xl border border-line p-3 text-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Pay to</p>
                <p className="mt-1 font-bold">{bank.bankName} · {bank.bankAccountName}</p>
                <p className="font-mono text-base font-black select-all">{bank.bankAccountNumber}</p>
                {bank.bankBranch && <p className="text-xs text-muted">Branch: {bank.bankBranch}</p>}
              </div>
            );
          })()}
          <TextField
            fullWidth
            size="small"
            label="Transfer reference"
            value={settleForm.transferReference}
            onChange={(e) => setSettleForm((s) => ({ ...s, transferReference: e.target.value }))}
          />
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Transfer date"
            InputLabelProps={{ shrink: true }}
            value={settleForm.transferDate}
            onChange={(e) => setSettleForm((s) => ({ ...s, transferDate: e.target.value }))}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Transfer amount (LKR)"
            value={settleForm.transferAmount}
            onChange={(e) => setSettleForm((s) => ({ ...s, transferAmount: e.target.value }))}
          />
          <TextField
            fullWidth
            size="small"
            label="Note (optional)"
            value={settleForm.note}
            onChange={(e) => setSettleForm((s) => ({ ...s, note: e.target.value }))}
          />
          <TextField
            fullWidth
            size="small"
            label="Override reason (if bank unverified)"
            value={settleForm.overrideReason}
            onChange={(e) => setSettleForm((s) => ({ ...s, overrideReason: e.target.value }))}
          />
          <Button component="label" variant="outlined" size="small">
            {settleForm.receipt ? settleForm.receipt.name : 'Attach receipt (optional)'}
            <input
              hidden
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setSettleForm((s) => ({ ...s, receipt: e.target.files?.[0] || null }))}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={settleAction.isPending || !settleForm.transferReference || !settleForm.transferDate}
            onClick={() => {
              settleAction.mutate({
                id: selectedPayoutId,
                payload: {
                  transferReference: settleForm.transferReference,
                  transferDate: settleForm.transferDate,
                  transferAmount: Number(settleForm.transferAmount),
                  note: settleForm.note || undefined,
                  overrideReason: settleForm.overrideReason || undefined,
                  receipt: settleForm.receipt || undefined,
                },
              }, {
                onSuccess: () => {
                  setSettleOpen(false);
                  setSelectedPayoutId(null);
                },
              });
            }}
          >
            Confirm paid
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
