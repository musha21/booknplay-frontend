import { useEffect, useRef, useState } from 'react';
import {
  Button, Checkbox, FormControlLabel, MenuItem, Select, Skeleton, TextField,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateAdminSubscriptionPlan } from '../../api/admin';
import { useAdminSubscriptionPlans } from '../../hooks/useAdmin';
import { PlanCode } from '../../constants/apiTypes';
import { formatCurrency } from '../../utils/formatters';
import {
  formatLimitCount,
  planDisplayName,
  resolvePlanLimits,
} from '../../utils/subscription';

function featuresToText(features) {
  if (Array.isArray(features)) return features.join(', ');
  return String(features || '');
}

function draftFromPlan(plan) {
  const limits = resolvePlanLimits(plan);
  return {
    name: plan.name || '',
    description: plan.description || '',
    priceMonthly: plan.priceMonthly ?? '',
    priceYearly: plan.priceYearly ?? '',
    currency: plan.currency || 'LKR',
    highlighted: Boolean(plan.highlighted),
    active: plan.active !== false,
    sortOrder: plan.sortOrder ?? 0,
    features: featuresToText(plan.features),
    commissionPercent: plan.commissionPercent ?? (String(plan.code).toUpperCase() === PlanCode.TRIAL ? '0' : '10'),
    maxVenues: limits.maxVenues == null ? '' : String(limits.maxVenues),
    unlimitedVenues: limits.maxVenues == null,
    maxCourtsPerVenue: limits.maxCourtsPerVenue == null ? '' : String(limits.maxCourtsPerVenue),
    unlimitedCourtsPerVenue: limits.maxCourtsPerVenue == null,
    maxStaff: limits.maxStaff == null ? '' : String(limits.maxStaff),
    unlimitedStaff: limits.maxStaff == null,
    calendarEnabled: limits.calendarEnabled,
    walkInEnabled: limits.walkInEnabled,
    earningsEnabled: limits.earningsEnabled,
    reportsEnabled: limits.reportsEnabled,
    advancedReportsEnabled: limits.advancedReportsEnabled,
    reason: '',
  };
}

function Flag({ label, checked, onChange }) {
  return (
    <FormControlLabel
      control={<Checkbox size="small" checked={checked} onChange={(event) => onChange(event.target.checked)} />}
      label={<span className="text-sm font-bold text-ink">{label}</span>}
    />
  );
}

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const { data: plans = [], isLoading } = useAdminSubscriptionPlans();
  const [selectedCode, setSelectedCode] = useState('');
  const [draft, setDraft] = useState(null);
  const loadedCodeRef = useRef('');
  const saveAction = useMutation({
    mutationFn: ({ code, payload }) => updateAdminSubscriptionPlan(code, payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Admin action completed');
      if (saved) {
        loadedCodeRef.current = String(saved.code || selectedCode);
        setDraft(draftFromPlan(saved));
      }
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Action failed'),
  });

  const selected = plans.find((plan) => String(plan.code) === selectedCode) || plans[0];

  useEffect(() => {
    if (!plans.length) return;
    const code = selectedCode || String(plans[0].code);
    if (!selectedCode) {
      setSelectedCode(code);
      return;
    }
    if (loadedCodeRef.current === code && draft) return;
    const plan = plans.find((row) => String(row.code) === code) || plans[0];
    loadedCodeRef.current = code;
    setDraft(draftFromPlan(plan));
  }, [plans, selectedCode, draft]);

  const selectPlan = (code) => {
    loadedCodeRef.current = '';
    setSelectedCode(code);
  };

  const setField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    if (!draft || !selected) return;
    const reason = String(draft.reason || '').trim();
    if (!reason) {
      toast.error('Audit reason is required');
      return;
    }
    if (!draft.unlimitedVenues) {
      const maxVenues = Number(draft.maxVenues);
      if (!Number.isFinite(maxVenues) || maxVenues < 1) {
        toast.error('Enter max venues (at least 1) or enable unlimited venues');
        return;
      }
    }
    if (!draft.unlimitedCourtsPerVenue) {
      const maxCourts = Number(draft.maxCourtsPerVenue);
      if (!Number.isFinite(maxCourts) || maxCourts < 1) {
        toast.error('Enter max courts per venue (at least 1) or enable unlimited courts');
        return;
      }
    }
    if (!draft.unlimitedStaff) {
      const maxStaff = Number(draft.maxStaff);
      if (!Number.isFinite(maxStaff) || maxStaff < 1) {
        toast.error('Enter max staff seats (at least 1) or enable unlimited staff');
        return;
      }
    }
    const commission = Number(draft.commissionPercent);
    if (!Number.isFinite(commission) || commission < 0 || commission > 100) {
      toast.error('Commission must be between 0 and 100');
      return;
    }

    const payload = {
      name: draft.name,
      description: draft.description,
      priceMonthly: draft.priceMonthly === '' ? undefined : Number(draft.priceMonthly),
      priceYearly: draft.priceYearly === '' ? undefined : Number(draft.priceYearly),
      currency: draft.currency,
      highlighted: draft.highlighted,
      active: draft.active,
      sortOrder: Number(draft.sortOrder) || 0,
      features: featuresToText(draft.features),
      commissionPercent: commission,
      unlimitedVenues: draft.unlimitedVenues,
      unlimitedCourtsPerVenue: draft.unlimitedCourtsPerVenue,
      maxVenues: draft.unlimitedVenues ? undefined : Number(draft.maxVenues),
      maxCourtsPerVenue: draft.unlimitedCourtsPerVenue ? undefined : Number(draft.maxCourtsPerVenue),
      unlimitedStaff: draft.unlimitedStaff,
      maxStaff: draft.unlimitedStaff ? undefined : Number(draft.maxStaff),
      calendarEnabled: draft.calendarEnabled,
      walkInEnabled: draft.walkInEnabled,
      earningsEnabled: draft.earningsEnabled,
      reportsEnabled: draft.reportsEnabled,
      advancedReportsEnabled: draft.advancedReportsEnabled,
      reason,
    };

    saveAction.mutate({ code: selected.code, payload });
  };

  return (
    <>
      <p className="eyebrow">Platform management</p>
      <h1 className="mt-2 text-3xl font-black">Subscription plans</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Edit prices, platform commission, and entitlements for TRIAL, STARTER, GROWTH, and PRO.
        Free trial defaults to 0% commission. Changes apply on the next plan assign.
      </p>

      {isLoading || !draft || !selected ? (
        <Skeleton className="!mt-7" variant="rounded" height={420} />
      ) : (
        <div className="mt-7 grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="surface-card p-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Plans</p>
            <div className="mt-3 flex flex-col gap-2">
              {plans.map((plan) => {
                const active = String(plan.code) === String(selected.code);
                const limits = resolvePlanLimits(plan);
                return (
                  <button
                    key={plan.code}
                    type="button"
                    onClick={() => selectPlan(String(plan.code))}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      active ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-surface hover:border-navy-300'
                    }`}
                  >
                    <strong className="block text-sm">{plan.name || planDisplayName(plan.code)}</strong>
                    <span className={`mt-1 block text-xs ${active ? 'text-lime-200' : 'text-muted'}`}>
                      {formatLimitCount(limits.maxVenues)} venues · {formatLimitCount(limits.maxStaff)} staff · {Number(plan.commissionPercent ?? 0)}% commission
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface-card space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink">{draft.name || planDisplayName(selected.code)}</h2>
                <p className="mt-1 text-sm text-muted">
                  {formatCurrency(Number(draft.priceMonthly) || 0, draft.currency)} / month
                  {String(selected.code) === PlanCode.TRIAL ? ' · trial catalog row' : ''}
                </p>
              </div>
              <Select
                size="small"
                value={String(selected.code)}
                onChange={(event) => selectPlan(event.target.value)}
                sx={{ minWidth: 160 }}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.code} value={String(plan.code)}>
                    {planDisplayName(plan.code)}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" value={draft.name} onChange={(e) => setField('name', e.target.value)} fullWidth />
              <TextField label="Currency" value={draft.currency} onChange={(e) => setField('currency', e.target.value)} fullWidth />
              <TextField
                label="Monthly price"
                type="number"
                value={draft.priceMonthly}
                onChange={(e) => setField('priceMonthly', e.target.value)}
                fullWidth
              />
              <TextField
                label="Yearly price"
                type="number"
                value={draft.priceYearly}
                onChange={(e) => setField('priceYearly', e.target.value)}
                fullWidth
              />
              <TextField
                label="Platform commission %"
                type="number"
                value={draft.commissionPercent}
                onChange={(e) => setField('commissionPercent', e.target.value)}
                fullWidth
                helperText="Booking share applied when this plan is assigned. Trial should be 0."
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
              <TextField
                label="Sort order"
                type="number"
                value={draft.sortOrder}
                onChange={(e) => setField('sortOrder', e.target.value)}
                fullWidth
              />
              <TextField
                className="sm:col-span-2"
                label="Features (comma-separated)"
                value={draft.features}
                onChange={(e) => setField('features', e.target.value)}
                fullWidth
              />
            </div>

            <TextField
              label="Description"
              value={draft.description}
              onChange={(e) => setField('description', e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-line p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Venue limit</p>
                <Flag label="Unlimited venues" checked={draft.unlimitedVenues} onChange={(v) => setField('unlimitedVenues', v)} />
                {!draft.unlimitedVenues && (
                  <TextField
                    className="!mt-2"
                    label="Max venues"
                    type="number"
                    value={draft.maxVenues}
                    onChange={(e) => setField('maxVenues', e.target.value)}
                    fullWidth
                    size="small"
                  />
                )}
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Courts per venue</p>
                <Flag
                  label="Unlimited courts"
                  checked={draft.unlimitedCourtsPerVenue}
                  onChange={(v) => setField('unlimitedCourtsPerVenue', v)}
                />
                {!draft.unlimitedCourtsPerVenue && (
                  <TextField
                    className="!mt-2"
                    label="Max courts per venue"
                    type="number"
                    value={draft.maxCourtsPerVenue}
                    onChange={(e) => setField('maxCourtsPerVenue', e.target.value)}
                    fullWidth
                    size="small"
                  />
                )}
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Staff seats</p>
                <Flag label="Unlimited staff" checked={draft.unlimitedStaff} onChange={(v) => setField('unlimitedStaff', v)} />
                {!draft.unlimitedStaff && (
                  <TextField
                    className="!mt-2"
                    label="Max staff"
                    type="number"
                    value={draft.maxStaff}
                    onChange={(e) => setField('maxStaff', e.target.value)}
                    fullWidth
                    size="small"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-line p-4">
              <Flag label="Calendar" checked={draft.calendarEnabled} onChange={(v) => setField('calendarEnabled', v)} />
              <Flag label="Walk-ins" checked={draft.walkInEnabled} onChange={(v) => setField('walkInEnabled', v)} />
              <Flag label="Earnings" checked={draft.earningsEnabled} onChange={(v) => setField('earningsEnabled', v)} />
              <Flag label="Reports" checked={draft.reportsEnabled} onChange={(v) => setField('reportsEnabled', v)} />
              <Flag label="Advanced reports" checked={draft.advancedReportsEnabled} onChange={(v) => setField('advancedReportsEnabled', v)} />
              <Flag label="Highlighted" checked={draft.highlighted} onChange={(v) => setField('highlighted', v)} />
              <Flag label="Active in catalog" checked={draft.active} onChange={(v) => setField('active', v)} />
            </div>

            <TextField
              required
              label="Audit reason"
              value={draft.reason}
              onChange={(e) => setField('reason', e.target.value)}
              fullWidth
              helperText="Required for every plan change."
            />

            <div className="flex justify-end">
              <Button
                variant="contained"
                color="secondary"
                disabled={saveAction.isPending || !String(draft.reason || '').trim()}
                onClick={save}
              >
                {saveAction.isPending ? 'Saving…' : 'Save plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
