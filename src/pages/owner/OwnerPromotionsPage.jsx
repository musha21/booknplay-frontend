import { useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { Campaign } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  OwnerDialog, OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
import SubscriptionRequiredPanel from '../../components/owner/SubscriptionRequiredPanel';
import {
  useCreateOwnerPromotion,
  useDeleteOwnerPromotion,
  useOwnerPromotions,
  useOwnerSubscription,
} from '../../hooks/useOwner';
import { canUsePromotions, isOwnerSubscriptionsEnabled } from '../../utils/subscription';

const emptyForm = () => ({
  code: '',
  name: '',
  type: 'PERCENT',
  value: '10',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  maxRedemptions: '',
  active: true,
});

export default function OwnerPromotionsPage() {
  const subscriptionsEnabled = isOwnerSubscriptionsEnabled();
  const { data: subscription } = useOwnerSubscription({ enabled: subscriptionsEnabled });
  const promotionsAllowed = !subscriptionsEnabled || canUsePromotions(subscription);
  const query = useOwnerPromotions({ enabled: promotionsAllowed });
  const createPromotion = useCreateOwnerPromotion();
  const deletePromotion = useDeleteOwnerPromotion();
  const rows = Array.isArray(query.data) ? query.data : [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async () => {
    await createPromotion.mutateAsync({
      code: form.code.trim(),
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      startDate: form.startDate,
      endDate: form.endDate,
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
      active: Boolean(form.active),
    });
    setOpen(false);
    setForm(emptyForm());
  };

  if (subscriptionsEnabled && subscription && !promotionsAllowed) {
    return (
      <SubscriptionRequiredPanel
        title="Promotions need a higher plan"
        description="Upgrade to Growth or Pro to unlock discount codes and promotions."
      />
    );
  }

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Commerce"
        title="Promotions"
        description="Discount codes for eligible bookings."
        actions={(
          <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
            Create promotion
          </button>
        )}
      />
      <OwnerSection className="mt-6">
        {query.isLoading ? (
          <Skeleton variant="rounded" height={240} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState
            icon={Campaign}
            title="No promotions"
            description="Create a code to offer percent or fixed discounts."
            action={<button type="button" className="btn-primary" onClick={() => setOpen(true)}>Create promotion</button>}
          />
        ) : (
          <OwnerResponsiveRows
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'code', label: 'Code', emphasize: true },
              { key: 'name', label: 'Name' },
              {
                key: 'offer',
                label: 'Offer',
                render: (row) => (
                  <>
                    {row.type === 'PERCENT' ? `${row.value}%` : `LKR ${row.value}`}
                    {!row.active && <span className="ml-2 text-xs font-extrabold uppercase text-amber-700">Inactive</span>}
                  </>
                ),
              },
              { key: 'dates', label: 'Dates', render: (row) => `${row.startDate} → ${row.endDate}` },
              {
                key: 'uses',
                label: 'Uses',
                render: (row) => `${row.redemptionCount ?? 0}${row.maxRedemptions != null ? ` / ${row.maxRedemptions}` : ''}`,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <button
                    type="button"
                    className="min-h-11 text-sm font-bold text-red-600"
                    disabled={deletePromotion.isPending}
                    onClick={() => deletePromotion.mutate(row.id)}
                  >
                    Delete
                  </button>
                ),
              },
            ]}
          />
        )}
      </OwnerSection>

      <OwnerDialog
        open={open}
        onClose={() => !createPromotion.isPending && setOpen(false)}
        title="Create promotion"
        actions={(
          <>
            <button type="button" className="btn-outline" disabled={createPromotion.isPending} onClick={() => setOpen(false)}>Cancel</button>
            <button
              type="button"
              className="btn-primary"
              disabled={createPromotion.isPending || !form.code.trim() || !form.name.trim()}
              onClick={submit}
            >
              {createPromotion.isPending ? 'Saving…' : 'Create'}
            </button>
          </>
        )}
      >
        <div className="grid gap-3 pt-1 sm:grid-cols-2">
          <TextField size="small" label="Code" value={form.code} onChange={setField('code')} fullWidth />
          <TextField size="small" label="Name" value={form.name} onChange={setField('name')} fullWidth />
          <TextField select size="small" label="Type" value={form.type} onChange={setField('type')} fullWidth>
            <MenuItem value="PERCENT">Percent</MenuItem>
            <MenuItem value="FIXED">Fixed amount</MenuItem>
          </TextField>
          <TextField size="small" label="Value" type="number" value={form.value} onChange={setField('value')} fullWidth />
          <TextField size="small" label="Start" type="date" value={form.startDate} onChange={setField('startDate')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="End" type="date" value={form.endDate} onChange={setField('endDate')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="Max redemptions" type="number" value={form.maxRedemptions} onChange={setField('maxRedemptions')} fullWidth className="sm:col-span-2" />
        </div>
      </OwnerDialog>
    </OwnerPage>
  );
}
