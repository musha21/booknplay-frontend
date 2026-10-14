import { useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { Campaign } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  OwnerDialog, OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import {
  useCreateOwnerPromotion,
  useDeleteOwnerPromotion,
  useOwnerPromotions,
} from '../../hooks/useOwner';

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
  const query = useOwnerPromotions();
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
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Offer</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Uses</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{row.code}</td>
                    <td className="px-4 py-3 text-muted">{row.name}</td>
                    <td className="px-4 py-3 text-ink">
                      {row.type === 'PERCENT' ? `${row.value}%` : `LKR ${row.value}`}
                      {!row.active && <span className="ml-2 text-xs font-extrabold uppercase text-amber-700">Inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-muted">{row.startDate} → {row.endDate}</td>
                    <td className="px-4 py-3 text-muted">{row.redemptionCount ?? 0}{row.maxRedemptions != null ? ` / ${row.maxRedemptions}` : ''}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-sm font-bold text-red-600"
                        disabled={deletePromotion.isPending}
                        onClick={() => deletePromotion.mutate(row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
