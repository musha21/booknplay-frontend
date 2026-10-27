import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createAdminBusiness,
  exportAdminCustomers,
  setAdminVenueStatus,
  setBusinessAccess,
  setBusinessCommission,
  setBusinessSubscription,
} from '../../api/admin';
import {
  useAdminAction,
  useAdminAudit,
  useAdminBusinesses,
  useAdminCustomers,
  useAdminSubscriptionPlans,
  useAdminVenues,
  useSendAdminMarketing,
} from '../../hooks/useAdmin';
import { PlanCode, SubscriptionStatus } from '../../constants/apiTypes';
import { planDisplayName, resolveTrialDurationDays, statusDisplayLabel } from '../../utils/subscription';
import { VENUE_STATUS_OPTIONS, venueStatusLabel } from '../../utils/venueStatus';

const Shell = ({ title, actions, children }) => (
  <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Platform management</p>
        <h1 className="mt-2 text-3xl font-black">{title}</h1>
      </div>
      {actions}
    </div>
    <div className="surface-card mt-7 overflow-x-auto">{children}</div>
  </>
);

const emptyCreateForm = () => ({
  businessName: '',
  ownerName: '',
  email: '',
  temporaryPassword: '',
  contactPhone: '',
  address: '',
  contactEmail: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankBranch: '',
});

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
  const { data: plans = [] } = useAdminSubscriptionPlans();
  const queryClient = useQueryClient();
  const trialPlan = plans.find((plan) => String(plan.code).toUpperCase() === PlanCode.TRIAL);
  const trialDays = resolveTrialDurationDays(trialPlan?.trialDurationDays);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyCreateForm);
  const [createdCredentials, setCreatedCredentials] = useState(null);

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
  const createAction = useMutation({
    mutationFn: createAdminBusiness,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setCreateOpen(false);
      setForm(emptyCreateForm());
      setCreatedCredentials({
        email: result.ownerEmail,
        temporaryPassword: result.temporaryPassword,
        businessName: result.name,
      });
      toast.success('Business created — share credentials with the owner only');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create business'),
  });

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submitCreate = (event) => {
    event.preventDefault();
    if (!form.temporaryPassword || form.temporaryPassword.length < 8) {
      toast.error('Temporary password must be at least 8 characters');
      return;
    }
    createAction.mutate({
      businessName: form.businessName.trim(),
      ownerName: form.ownerName.trim(),
      email: form.email.trim(),
      temporaryPassword: form.temporaryPassword,
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
      contactEmail: form.contactEmail.trim() || undefined,
      bankName: form.bankName.trim() || undefined,
      bankAccountName: form.bankAccountName.trim() || undefined,
      bankAccountNumber: form.bankAccountNumber.trim() || undefined,
      bankBranch: form.bankBranch.trim() || undefined,
    });
  };

  return (
    <Shell
      title="Businesses"
      actions={(
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Create business
        </Button>
      )}
    >
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
                        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
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

      <Dialog open={createOpen} onClose={() => !createAction.isPending && setCreateOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={submitCreate}>
          <DialogTitle>Create business</DialogTitle>
          <DialogContent className="!space-y-3 pt-2">
            <p className="text-sm text-muted">
              Provisions an owner login and business with a free trial. Share the temporary password with the owner only —
              they can change it later in Profile. Self-register remains available for other owners.
            </p>
            <TextField label="Business name" value={form.businessName} onChange={setField('businessName')} required fullWidth />
            <TextField label="Owner name" value={form.ownerName} onChange={setField('ownerName')} required fullWidth />
            <TextField label="Owner email (login)" type="email" value={form.email} onChange={setField('email')} required fullWidth />
            <TextField
              label="Temporary password"
              type="password"
              value={form.temporaryPassword}
              onChange={setField('temporaryPassword')}
              required
              fullWidth
              helperText="Min 8 characters. Shown once after create."
            />
            <TextField label="Contact phone" value={form.contactPhone} onChange={setField('contactPhone')} required fullWidth placeholder="+9477..." />
            <TextField label="Business address" value={form.address} onChange={setField('address')} required fullWidth />
            <TextField label="Contact email (optional)" type="email" value={form.contactEmail} onChange={setField('contactEmail')} fullWidth />
            <p className="pt-2 text-xs font-bold uppercase text-muted">Bank details (optional)</p>
            <TextField label="Bank name" value={form.bankName} onChange={setField('bankName')} fullWidth />
            <TextField label="Account holder" value={form.bankAccountName} onChange={setField('bankAccountName')} fullWidth />
            <TextField label="Account number" value={form.bankAccountNumber} onChange={setField('bankAccountNumber')} fullWidth />
            <TextField label="Branch" value={form.bankBranch} onChange={setField('bankBranch')} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)} disabled={createAction.isPending}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createAction.isPending}>
              {createAction.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(createdCredentials)} onClose={() => setCreatedCredentials(null)} fullWidth maxWidth="sm">
        <DialogTitle>Owner credentials</DialogTitle>
        <DialogContent className="!space-y-3 pt-2">
          <p className="text-sm text-muted">
            Share with the owner of <strong>{createdCredentials?.businessName}</strong> only. This password is shown once.
            They sign in at owner login and can change the password in Profile.
          </p>
          <TextField label="Email" value={createdCredentials?.email || ''} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Temporary password" value={createdCredentials?.temporaryPassword || ''} fullWidth InputProps={{ readOnly: true }} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              const text = `Email: ${createdCredentials?.email}\nPassword: ${createdCredentials?.temporaryPassword}`;
              try {
                await navigator.clipboard.writeText(text);
                toast.success('Copied credentials');
              } catch {
                toast.error('Could not copy — select and copy manually');
              }
            }}
          >
            Copy
          </Button>
          <Button variant="contained" onClick={() => setCreatedCredentials(null)}>Done</Button>
        </DialogActions>
      </Dialog>
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
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(null); // 'SMS' | 'EMAIL' | null
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data = [] } = useAdminCustomers(search ? { query: search } : {});
  const marketing = useSendAdminMarketing();

  const closeDialog = () => {
    if (marketing.isPending) return;
    setDialog(null);
    setSubject('');
    setMessage('');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportAdminCustomers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Customer list exported');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }
    if (dialog === 'EMAIL' && !subject.trim()) {
      toast.error('Subject is required for email');
      return;
    }
    marketing.mutate(
      {
        channel: dialog,
        subject: dialog === 'EMAIL' ? subject.trim() : undefined,
        message: message.trim(),
      },
      { onSuccess: () => closeDialog() }
    );
  };

  return (
    <>
      <Shell
        title="Customers"
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <TextField
              size="small"
              placeholder="Search name, email, phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSearch(query.trim());
              }}
            />
            <Button variant="outlined" onClick={() => setSearch(query.trim())}>Search</Button>
            <Button variant="outlined" disabled={exporting} onClick={handleExport}>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </Button>
            <Button variant="contained" onClick={() => setDialog('SMS')}>Send SMS</Button>
          </div>
        )}
      >
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

      <Dialog open={Boolean(dialog)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialog === 'SMS' ? 'Send marketing SMS' : 'Send marketing email'}</DialogTitle>
        <DialogContent className="!space-y-3 pt-2">
          <p className="text-sm text-slate-600">
            Sends to all ACTIVE registered customers
            {dialog === 'SMS' ? ' with a phone number' : ' with an email address'}.
          </p>
          {dialog === 'EMAIL' && (
            <TextField
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              fullWidth
            />
          )}
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            fullWidth
            multiline
            minRows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={marketing.isPending}>Cancel</Button>
          <Button variant="contained" onClick={handleSend} disabled={marketing.isPending}>
            {marketing.isPending ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
