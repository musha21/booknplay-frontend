import { useEffect, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerCourts, useOwnerVenues } from '../../hooks/useOwner';
import ownerCalendarApi from '../../api/ownerCalendar';

export default function OwnerWalkInPage() {
  const queryClient = useQueryClient();
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const [form, setForm] = useState({
    courtId: '',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '18:00',
    endTime: '19:00',
    guestName: '',
    guestPhone: '',
    amount: '',
  });
  const [saving, setSaving] = useState(false);
  const courtsQuery = useOwnerCourts(venueId || undefined);
  const courts = courtsQuery.data || [];

  useEffect(() => {
    if (!venueId && venues[0]) setVenueId(venues[0].id);
  }, [venues, venueId]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, courtId: courts[0]?.id || '' }));
  }, [venueId, courts]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.courtId || !form.guestName.trim()) {
      toast.error('Court and guest name are required');
      return;
    }
    setSaving(true);
    try {
      await ownerCalendarApi.createWalkIn({
        courtId: form.courtId,
        date: form.date,
        startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
        guestName: form.guestName.trim(),
        guestPhone: form.guestPhone.trim() || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'calendar'] });
      toast.success('Walk-in booking created');
      setForm((prev) => ({ ...prev, guestName: '', guestPhone: '', amount: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create walk-in');
    } finally {
      setSaving(false);
    }
  };

  return (
    <OwnerPage className="max-w-2xl">
      <OwnerPageHeader
        eyebrow="Operations"
        title="Walk-in"
        description="Book a walk-in guest without online checkout."
      />
      <OwnerSection className="mt-6">
        <form onSubmit={submit} className="surface-card grid gap-3 p-5 sm:grid-cols-2">
          <TextField select size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)} fullWidth className="sm:col-span-2">
            {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Court" value={form.courtId} onChange={setField('courtId')} fullWidth className="sm:col-span-2" disabled={!venueId}>
            {courts.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField size="small" label="Date" type="date" value={form.date} onChange={setField('date')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="Amount (optional)" type="number" value={form.amount} onChange={setField('amount')} fullWidth />
          <TextField size="small" label="Start" type="time" value={form.startTime} onChange={setField('startTime')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="End" type="time" value={form.endTime} onChange={setField('endTime')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="Guest name" value={form.guestName} onChange={setField('guestName')} fullWidth className="sm:col-span-2" required />
          <TextField size="small" label="Guest phone" value={form.guestPhone} onChange={setField('guestPhone')} fullWidth className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving || !venues.length}>
              {saving ? 'Creating…' : 'Create walk-in'}
            </button>
          </div>
        </form>
      </OwnerSection>
    </OwnerPage>
  );
}
