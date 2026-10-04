import { useState } from 'react';
import { Button, MenuItem, Select, TextField } from '@mui/material';
import { setAdminVenueStatus, setBusinessAccess, setBusinessCommission, setBusinessSubscription } from '../../api/admin';
import { useAdminAction, useAdminAudit, useAdminBusinesses, useAdminCustomers, useAdminVenues } from '../../hooks/useAdmin';
import { PlanCode, SubscriptionStatus } from '../../constants/apiTypes';
import { planDisplayName, statusDisplayLabel } from '../../utils/subscription';
import { VENUE_STATUS_OPTIONS, venueStatusLabel } from '../../utils/venueStatus';

const Shell = ({ title, children }) => (
  <>
    <p className="eyebrow">Platform management</p>
    <h1 className="mt-2 text-3xl font-black">{title}</h1>
    <div className="surface-card mt-7 overflow-x-auto">{children}</div>
  </>
);

const Table = ({ head, children }) => (
  <table className="w-full min-w-[760px] text-left text-sm">
    <thead className="border-b border-line bg-canvas text-xs uppercase text-muted">
      <tr>{head.map((x) => <th key={x} className="p-4">{x}</th>)}</tr>
    </thead>
    <tbody className="divide-y divide-line">{children}</tbody>
  </table>
);

function subscriptionLabel(business) {
  const plan = business.planCode || business.subscription?.planCode;
  const status = business.subscriptionStatus || business.subscription?.status;
  const trialEnds = business.trialEndsAt || business.subscription?.trialEndsAt;
  if (!plan && !status) return '—';
  const bits = [
    plan ? planDisplayName(plan) : null,
    status ? statusDisplayLabel(status) : null,
    trialEnds ? `ends ${new Date(trialEnds).toLocaleDateString()}` : null,
  ].filter(Boolean);
  return bits.join(' · ');
}

function limitsLabel(business) {
  const limits = business.limits || business.subscription?.limits;
  if (!limits) return null;
  const venues = limits.maxVenues == null ? '∞ venues' : `${limits.maxVenues} venues`;
  const reports = limits.reportsEnabled
    ? (limits.advancedReportsEnabled ? 'adv. reports' : 'reports')
    : 'no reports';
  return `${venues} · ${reports}`;
}

function CommissionCell({ business, onSave, pending }) {
  const [value, setValue] = useState(String(business.commissionPercent ?? 10));
  return (
    <div className="flex min-w-[140px] flex-col gap-2">
      <TextField
        size="small"
        type="number"
        label="%"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        inputProps={{ min: 0, max: 100, step: 0.01 }}
      />
      <Button
        size="small"
        variant="outlined"
        disabled={pending}
        onClick={() => onSave(business.id, value)}
      >
        Save
      </Button>
    </div>
  );
}

export function AdminBusinessesPage() {
  const { data = [] } = useAdminBusinesses();
  const accessAction = useAdminAction(
    ({ id, params }) => setBusinessAccess(id, params),
    ['admin-businesses', 'admin-dashboard'],
  );
  const subscriptionAction = useAdminAction(
    ({ id, payload }) => setBusinessSubscription(id, payload),
    ['admin-businesses', 'admin-dashboard'],
  );
  const commissionAction = useAdminAction(
    ({ id, params }) => setBusinessCommission(id, params),
    ['admin-businesses', 'admin-dashboard'],
  );

  return (
    <Shell title="Businesses">
      <Table head={['Business', 'Owner', 'Venues', 'Commission', 'Subscription', 'Access']}>
        {data.map((x) => (
          <tr key={x.id}>
            <td className="p-4 font-bold">{x.name}</td>
            <td className="p-4">{x.ownerEmail}</td>
            <td className="p-4">{x.venueCount}</td>
            <td className="p-4">
              <CommissionCell
                key={`${x.id}-${x.commissionPercent}`}
                business={x}
                pending={commissionAction.isPending}
                onSave={(id, raw) => {
                  const value = Number(raw);
                  if (!Number.isFinite(value) || value < 0 || value > 100) return;
                  commissionAction.mutate({
                    id,
                    params: { value, reason: 'Commission override in admin portal' },
                  });
                }}
              />
            </td>
            <td className="p-4">
              <div className="space-y-2">
                <p className="text-sm">{subscriptionLabel(x)}</p>
                {limitsLabel(x) && <p className="text-xs text-muted">{limitsLabel(x)}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={subscriptionAction.isPending}
                    onClick={() => subscriptionAction.mutate({
                      id: x.id,
                      payload: {
                        planCode: PlanCode.TRIAL,
                        status: SubscriptionStatus.TRIALING,
                        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                        reason: 'Extended trial in admin portal',
                      },
                    })}
                  >
                    Extend trial
                  </Button>
                  <Select
                    size="small"
                    displayEmpty
                    value=""
                    disabled={subscriptionAction.isPending}
                    onChange={(event) => {
                      const planCode = event.target.value;
                      if (!planCode) return;
                      subscriptionAction.mutate({
                        id: x.id,
                        payload: {
                          planCode,
                          status: SubscriptionStatus.ACTIVE,
                          reason: 'Forced plan in admin portal',
                        },
                      });
                    }}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="" disabled>Set plan</MenuItem>
                    <MenuItem value={PlanCode.STARTER}>Starter</MenuItem>
                    <MenuItem value={PlanCode.GROWTH}>Growth</MenuItem>
                    <MenuItem value={PlanCode.PRO}>Pro</MenuItem>
                  </Select>
                </div>
              </div>
            </td>
            <td className="p-4">
              <Button
                color={x.enabled && !x.locked ? 'error' : 'success'}
                onClick={() => accessAction.mutate({
                  id: x.id,
                  params: { enabled: !x.enabled, locked: x.enabled, reason: 'Changed in admin portal' },
                })}
              >
                {x.enabled && !x.locked ? 'Suspend' : 'Enable'}
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </Shell>
  );
}

export function AdminVenuesPage() {
  const { data = [] } = useAdminVenues();
  const action = useAdminAction(
    ({ id, status }) => setAdminVenueStatus(id, { status, reason: 'Changed in admin portal' }),
    ['admin-venues', 'admin-dashboard'],
  );
  return (
    <Shell title="Venues">
      <Table head={['Venue', 'Business', 'City', 'Type', 'Status']}>
        {data.map((x) => (
          <tr key={x.id}>
            <td className="p-4 font-bold">{x.name}</td>
            <td className="p-4">{x.businessName}</td>
            <td className="p-4">{x.city}</td>
            <td className="p-4">{x.venueType}</td>
            <td className="p-4">
              <Select size="small" value={x.status} onChange={(e) => action.mutate({ id: x.id, status: e.target.value })}>
                {VENUE_STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{venueStatusLabel(s)}</MenuItem>)}
              </Select>
            </td>
          </tr>
        ))}
      </Table>
    </Shell>
  );
}

export function AdminCustomersPage() {
  const { data = [] } = useAdminCustomers();
  return (
    <Shell title="Customers">
      <Table head={['Name', 'Email', 'Phone', 'Status']}>
        {data.map((x) => (
          <tr key={x.id}>
            <td className="p-4 font-bold">{x.firstName} {x.lastName}</td>
            <td className="p-4">{x.email}</td>
            <td className="p-4">{x.phone}</td>
            <td className="p-4">{x.status}</td>
          </tr>
        ))}
      </Table>
    </Shell>
  );
}

export function AdminAuditPage() {
  const { data = [] } = useAdminAudit();
  return (
    <Shell title="Audit log">
      <Table head={['Time', 'Administrator', 'Action', 'Resource', 'Reason']}>
        {data.map((x) => (
          <tr key={x.id}>
            <td className="p-4">{new Date(x.createdAt).toLocaleString()}</td>
            <td className="p-4">{x.adminEmail}</td>
            <td className="p-4 font-bold">{x.action.replaceAll('_', ' ')}</td>
            <td className="p-4">{x.resourceType} · {x.resourceId}</td>
            <td className="p-4">{x.reason || '—'}</td>
          </tr>
        ))}
      </Table>
    </Shell>
  );
}
