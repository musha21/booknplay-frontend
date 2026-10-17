import { useEffect, useState } from 'react';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Build } from '@mui/icons-material';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import OwnerResponsiveRows from '../../components/owner/OwnerResponsiveRows';
import {
  useOwnerCourts,
  useOwnerMaintenance,
  useOwnerVenues,
} from '../../hooks/useOwner';
import ownerCalendarApi from '../../api/ownerCalendar';

export default function OwnerMaintenancePage() {
  const queryClient = useQueryClient();
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const [courtId, setCourtId] = useState('');
  const [form, setForm] = useState({
    startDateTime: dayjs().minute(0).second(0).format('YYYY-MM-DDTHH:mm'),
    endDateTime: dayjs().add(2, 'hour').minute(0).second(0).format('YYYY-MM-DDTHH:mm'),
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const courtsQuery = useOwnerCourts(venueId || undefined);
  const maintenanceQuery = useOwnerMaintenance(courtId || undefined);
  const courts = courtsQuery.data || [];
  const rows = Array.isArray(maintenanceQuery.data) ? maintenanceQuery.data : [];

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
      await ownerCalendarApi.addMaintenance(courtId, {
        startDateTime: form.startDateTime.length === 16 ? `${form.startDateTime}:00` : form.startDateTime,
        endDateTime: form.endDateTime.length === 16 ? `${form.endDateTime}:00` : form.endDateTime,
        description: form.description.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'maintenance', courtId] });
      toast.success('Maintenance window created');
      setForm((prev) => ({ ...prev, description: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create maintenance window');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await ownerCalendarApi.deleteMaintenance(id);
      await queryClient.invalidateQueries({ queryKey: ['owner', 'maintenance', courtId] });
      toast.success('Maintenance window removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove maintenance');
    }
  };

  return (
    <OwnerPage>
      <OwnerPageHeader eyebrow="Operations" title="Maintenance" description="Schedule court downtime windows." />
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
          <TextField size="small" label="Starts" type="datetime-local" value={form.startDateTime} onChange={setField('startDateTime')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="Ends" type="datetime-local" value={form.endDateTime} onChange={setField('endDateTime')} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="Description" value={form.description} onChange={setField('description')} fullWidth className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving || !courtId}>{saving ? 'Saving…' : 'Add maintenance'}</button>
          </div>
        </form>
      </OwnerSection>

      <OwnerSection className="mt-8">
        {!courtId ? (
          <OwnerEmptyState icon={Build} title="Select a court" description="Choose a venue and court to manage maintenance." />
        ) : maintenanceQuery.isLoading ? (
          <Skeleton variant="rounded" height={200} className="!rounded-[20px]" />
        ) : rows.length === 0 ? (
          <OwnerEmptyState icon={Build} title="No maintenance windows" description="This court has no scheduled downtime." />
        ) : (
          <OwnerResponsiveRows
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: 'starts',
                label: 'Starts',
                emphasize: true,
                render: (row) => (row.startDateTime ? new Date(row.startDateTime).toLocaleString() : '—'),
              },
              {
                key: 'ends',
                label: 'Ends',
                render: (row) => (row.endDateTime ? new Date(row.endDateTime).toLocaleString() : '—'),
              },
              { key: 'description', label: 'Description', render: (row) => row.description || '—' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <button type="button" className="min-h-11 text-sm font-bold text-red-600" onClick={() => remove(row.id)}>
                    Remove
                  </button>
                ),
              },
            ]}
          />
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
