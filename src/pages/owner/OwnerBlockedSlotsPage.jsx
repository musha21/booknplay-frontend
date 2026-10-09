import { useEffect, useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Block } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import {
  useOwnerBlockedSlots,
  useOwnerCourts,
  useOwnerVenues,
} from '../../hooks/useOwner';
import ownerCalendarApi from '../../api/ownerCalendar';

export default function OwnerBlockedSlotsPage() {
  const queryClient = useQueryClient();
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const [courtId, setCourtId] = useState('');
  const [form, setForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '12:00',
    endTime: '14:00',
    reason: '',
  });
  const [saving, setSaving] = useState(false);
  const courtsQuery = useOwnerCourts(venueId || undefined);
  const blockedQuery = useOwnerBlockedSlots(courtId || undefined);
  const courts = courtsQuery.data || [];
  const rows = Array.isArray(blockedQuery.data) ? blockedQuery.data : [];

  useEffect(() => {
    if (!venueId && venues[0]) setVenueId(venues[0].id);
  }, [venues, venueId]);

  useEffect(() => {
    setCourtId(courts[0]?.id || '');
  }, [venueId, courts]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const create = async (event) => {
    event.preventDefault();
    if (!courtId) return;
    setSaving(true);
    try {
      await ownerCalendarApi.addBlockedSlot(courtId, {
        date: form.date,
        startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
        reason: form.reason.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'blocked-slots', courtId] });
      toast.success('Slot blocked');
      setForm((prev) => ({ ...prev, reason: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not block slot');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await ownerCalendarApi.deleteBlockedSlot(id);
      await queryClient.invalidateQueries({ queryKey: ['owner', 'blocked-slots', courtId] });
      toast.success('Blocked slot removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove blocked slot');
    }
  };

  return (
    <OwnerPage>
      <OwnerPageHeader eyebrow="Operations" title="Blocked slots" description="Close specific time windows on a court." />
      <OwnerSection className="mt-6 grid gap-3 sm:grid-cols-2 max-w-2xl">
        <TextField select size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)} fullWidth>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Court" value={courtId} onChange={(e) => setCourtId(e.target.value)} fullWidth>
          {courts.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
      </OwnerSection>

      <OwnerSection className="mt-6 max-w-2xl">
        <form onSubmit={create} className="surface-card grid gap-3 p-5 sm:grid-cols-2">
          <TextField size="small" label="Date" type="date" value={form.date} onChange={setField('date')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="Reason" value={form.reason} onChange={setField('reason')} fullWidth />
          <TextField size="small" label="Start" type="time" value={form.startTime} onChange={setField('startTime')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="End" type="time" value={form.endTime} onChange={setField('endTime')} fullWidth InputLabelProps={{ shrink: true }} />
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving || !courtId}>{saving ? 'Saving…' : 'Block slot'}</button>
          </div>
        </form>
      </OwnerSection>

      <OwnerSection className="mt-8">
        {!courtId ? (
          <OwnerEmptyState icon={Block} title="Select a court" description="Choose a venue and court to manage blocks." />
        ) : blockedQuery.isLoading ? (
          <Skeleton variant="rounded" height={200} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState icon={Block} title="No blocked slots" description="This court has no manual blocks." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3 font-bold text-ink">{row.date}</td>
                    <td className="px-4 py-3 text-muted">{String(row.startTime || '').slice(0, 5)}–{String(row.endTime || '').slice(0, 5)}</td>
                    <td className="px-4 py-3 text-muted">{row.reason || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-sm font-bold text-red-600" onClick={() => remove(row.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
