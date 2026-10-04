import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, FormControlLabel, Skeleton, TextField } from '@mui/material';
import {
  ArrowBack, ArrowDownward, ArrowUpward, CloudUpload, Delete, Policy, Save, Send, Stadium,
} from '@mui/icons-material';
import { toast } from 'sonner';
import ownerVenuesApi from '../../api/ownerVenues';
import LocationPicker from '../../components/owner/LocationPicker';
import {
  OwnerPage, OwnerPageHeader, OwnerSection, OwnerStatusBadge,
} from '../../components/owner/OwnerDashboardUi';
import VenueCarousel from '../../components/ui/VenueCarousel';
import { useOwnerVenue, useSubmitOwnerVenue } from '../../hooks/useOwner';
import useAuthStore from '../../stores/authStore';
import { venueStatusLabel } from '../../utils/venueStatus';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

const emptyHours = () => DAYS.map((dayOfWeek) => ({
  dayOfWeek,
  openTime: '06:00',
  closeTime: '22:00',
  closed: false,
}));

function statusTone(status) {
  if (status === 'APPROVED' || status === 'ACTIVE') return 'live';
  if (status === 'PENDING_APPROVAL') return 'info';
  if (status === 'REJECTED' || status === 'SUSPENDED') return 'danger';
  if (status === 'DRAFT') return 'warn';
  return 'neutral';
}

function toTimeInput(value) {
  if (!value) return '06:00';
  return String(value).slice(0, 5);
}

function toTimeApi(value) {
  if (!value) return '06:00:00';
  return value.length === 5 ? `${value}:00` : value;
}

function formFromVenue(venue) {
  return {
    name: venue.name || '',
    venueType: venue.venueType || venue.sportName || '',
    description: venue.description || '',
    address: venue.address || '',
    city: venue.city || '',
    formattedAddress: venue.formattedAddress || venue.address || '',
    latitude: venue.latitude ?? null,
    longitude: venue.longitude ?? null,
    amenitiesText: (venue.amenities || []).join(', '),
    rulesText: (venue.rules || []).join(', '),
    additionalRules: venue.additionalRules || '',
  };
}

function hoursFromRows(rows) {
  if (!Array.isArray(rows) || !rows.length) return emptyHours();
  const byDay = Object.fromEntries(rows.map((row) => [row.dayOfWeek, row]));
  return DAYS.map((dayOfWeek) => {
    const row = byDay[dayOfWeek];
    return {
      dayOfWeek,
      openTime: toTimeInput(row?.openTime),
      closeTime: toTimeInput(row?.closeTime),
      closed: Boolean(row?.closed ?? row?.isClosed),
    };
  });
}

function VenueEditor({ venueId, venue, initialHours }) {
  const owner = useAuthStore((state) => state.owner);
  const queryClient = useQueryClient();
  const submitVenue = useSubmitOwnerVenue();
  const [form, setForm] = useState(() => formFromVenue(venue));
  const [hours, setHours] = useState(() => hoursFromRows(initialHours));

  const media = useMemo(() => {
    if (Array.isArray(venue?.media) && venue.media.length) {
      return [...venue.media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return (venue?.images || []).map((url, index) => ({ id: `legacy-${index}`, url, sortOrder: index }));
  }, [venue]);

  const invalidateVenue = async () => {
    await queryClient.invalidateQueries({ queryKey: ['owner', 'venues', venueId] });
    await queryClient.invalidateQueries({ queryKey: ['owner', 'venues'] });
  };

  const saveDetails = useMutation({
    mutationFn: () => ownerVenuesApi.updateVenue(venueId, {
      name: form.name,
      venueType: form.venueType,
      description: form.description,
      address: form.address || form.formattedAddress,
      city: form.city,
      formattedAddress: form.formattedAddress,
      latitude: form.latitude,
      longitude: form.longitude,
      amenities: form.amenitiesText.split(',').map((item) => item.trim()).filter(Boolean),
      rules: form.rulesText.split(',').map((item) => item.trim()).filter(Boolean),
      additionalRules: form.additionalRules,
    }),
    onSuccess: async () => {
      await invalidateVenue();
      toast.success('Venue details saved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not save venue details'),
  });

  const saveHours = useMutation({
    mutationFn: () => ownerVenuesApi.replaceOperatingHours(venueId, hours.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      openTime: toTimeApi(day.openTime),
      closeTime: toTimeApi(day.closeTime),
      closed: day.closed,
    }))),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'venues', venueId, 'hours'] });
      toast.success('Operating hours saved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not save hours'),
  });

  const uploadMedia = useMutation({
    mutationFn: (files) => ownerVenuesApi.uploadVenueMedia(venueId, files),
    onSuccess: async () => {
      await invalidateVenue();
      toast.success('Photos uploaded');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not upload photos'),
  });

  const reorderMedia = useMutation({
    mutationFn: (mediaIds) => ownerVenuesApi.reorderVenueMedia(venueId, mediaIds),
    onSuccess: async () => {
      await invalidateVenue();
      toast.success('Photo order updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not reorder photos'),
  });

  const deleteMedia = useMutation({
    mutationFn: (mediaId) => ownerVenuesApi.deleteVenueMedia(venueId, mediaId),
    onSuccess: async () => {
      await invalidateVenue();
      toast.success('Photo removed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not remove photo'),
  });

  const canSubmit = venue?.status === 'DRAFT' || venue?.status === 'REJECTED';
  const courts = venue?.courts || [];

  const moveMedia = (index, delta) => {
    const next = [...media];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    if (String(next[index].id).startsWith('legacy-')) {
      toast.error('Re-upload photos before reordering');
      return;
    }
    [next[index], next[target]] = [next[target], next[index]];
    reorderMedia.mutate(next.map((item) => item.id));
  };

  return (
    <OwnerPage className="max-w-5xl">
      <OwnerPageHeader
        eyebrow="Venue settings"
        title={venue.name || 'Edit venue'}
        description="Update details, photos, hours and spaces. Approved venues stay live when you save."
        actions={(
          <>
            <OwnerStatusBadge tone={statusTone(venue.status)}>{venueStatusLabel(venue.status)}</OwnerStatusBadge>
            <Button component={Link} to="/owner" startIcon={<ArrowBack />}>Overview</Button>
            {canSubmit && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Send />}
                disabled={submitVenue.isPending}
                onClick={() => submitVenue.mutate(venueId)}
              >
                Publish venue
              </Button>
            )}
          </>
        )}
      />

      <OwnerSection className="mt-8 surface-card overflow-hidden p-0">
        <VenueCarousel venue={venue} owner={owner} imageClassName="h-56 w-full object-cover sm:h-72" />
      </OwnerSection>

      <OwnerSection className="mt-6 surface-card p-5 sm:p-6">
        <h2 className="text-lg font-black text-ink">Details and location</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField label="Venue name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} fullWidth />
          <TextField label="Venue type" value={form.venueType} onChange={(e) => setForm((s) => ({ ...s, venueType: e.target.value }))} fullWidth />
          <TextField
            className="md:col-span-2"
            label="Description"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField label="City" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} fullWidth />
          <TextField label="Address" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} fullWidth />
        </div>
        <div className="mt-4">
          <LocationPicker
            value={{
              formattedAddress: form.formattedAddress,
              latitude: form.latitude,
              longitude: form.longitude,
            }}
            onChange={(location) => setForm((s) => ({
              ...s,
              formattedAddress: location?.formattedAddress || s.formattedAddress,
              latitude: location?.latitude ?? s.latitude,
              longitude: location?.longitude ?? s.longitude,
              address: location?.formattedAddress || s.address,
            }))}
          />
        </div>
        <div className="mt-5">
          <Button variant="contained" color="secondary" startIcon={<Save />} disabled={saveDetails.isPending} onClick={() => saveDetails.mutate()}>
            {saveDetails.isPending ? 'Saving…' : 'Save details'}
          </Button>
        </div>
      </OwnerSection>

      <OwnerSection className="mt-6 surface-card p-5 sm:p-6">
        <h2 className="text-lg font-black text-ink">Amenities and rules</h2>
        <div className="mt-4 grid gap-4">
          <TextField
            label="Amenities"
            helperText="Separate with commas"
            value={form.amenitiesText}
            onChange={(e) => setForm((s) => ({ ...s, amenitiesText: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Rules"
            helperText="Separate with commas"
            value={form.rulesText}
            onChange={(e) => setForm((s) => ({ ...s, rulesText: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Additional rules"
            value={form.additionalRules}
            onChange={(e) => setForm((s) => ({ ...s, additionalRules: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
          />
        </div>
        <div className="mt-5">
          <Button variant="contained" color="secondary" startIcon={<Save />} disabled={saveDetails.isPending} onClick={() => saveDetails.mutate()}>
            Save amenities and rules
          </Button>
        </div>
      </OwnerSection>

      <OwnerSection className="mt-6 surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-ink">Venue photos</h2>
            <p className="mt-1 text-sm text-muted">Up to 6 photos. At least one is required to publish. The first ordered photo is the cover.</p>
          </div>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            disabled={uploadMedia.isPending || media.length >= 6}
          >
            Upload
            <input
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = [...(event.target.files || [])];
                event.target.value = '';
                if (!files.length) return;
                uploadMedia.mutate(files);
              }}
            />
          </Button>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {media.map((item, index) => (
            <li key={item.id || item.url} className="overflow-hidden rounded-2xl border border-line bg-canvas/50">
              <img src={item.url} alt="" className="h-36 w-full object-cover" loading="lazy" />
              <div className="flex flex-wrap gap-2 p-3">
                <Button size="small" disabled={index === 0 || reorderMedia.isPending} onClick={() => moveMedia(index, -1)} startIcon={<ArrowUpward />}>Up</Button>
                <Button size="small" disabled={index === media.length - 1 || reorderMedia.isPending} onClick={() => moveMedia(index, 1)} startIcon={<ArrowDownward />}>Down</Button>
                {!String(item.id).startsWith('legacy-') && (
                  <Button size="small" color="error" disabled={deleteMedia.isPending} onClick={() => deleteMedia.mutate(item.id)} startIcon={<Delete />}>Remove</Button>
                )}
                {index === 0 && <span className="ml-auto self-center text-[11px] font-extrabold uppercase tracking-wider text-muted">Cover</span>}
              </div>
            </li>
          ))}
        </ul>
        {!media.length && <p className="mt-4 text-sm text-muted">No photos yet. Drafts can stay empty; add at least one before you publish.</p>}
      </OwnerSection>

      <OwnerSection className="mt-6 surface-card p-5 sm:p-6">
        <h2 className="text-lg font-black text-ink">Operating hours</h2>
        <div className="mt-4 space-y-3">
          {hours.map((day, index) => (
            <div key={day.dayOfWeek} className="grid gap-3 rounded-2xl border border-line p-3 sm:grid-cols-[8rem_1fr_1fr_auto] sm:items-center">
              <p className="text-sm font-extrabold text-ink">{day.dayOfWeek.slice(0, 3)}</p>
              <TextField
                type="time"
                label="Opens"
                size="small"
                disabled={day.closed}
                value={day.openTime}
                onChange={(e) => setHours((rows) => rows.map((row, i) => (i === index ? { ...row, openTime: e.target.value } : row)))}
              />
              <TextField
                type="time"
                label="Closes"
                size="small"
                disabled={day.closed}
                value={day.closeTime}
                onChange={(e) => setHours((rows) => rows.map((row, i) => (i === index ? { ...row, closeTime: e.target.value } : row)))}
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={day.closed}
                    onChange={(e) => setHours((rows) => rows.map((row, i) => (i === index ? { ...row, closed: e.target.checked } : row)))}
                  />
                )}
                label="Closed"
              />
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Button variant="contained" color="secondary" startIcon={<Save />} disabled={saveHours.isPending} onClick={() => saveHours.mutate()}>
            {saveHours.isPending ? 'Saving…' : 'Save hours'}
          </Button>
        </div>
      </OwnerSection>

      <OwnerSection className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="surface-card p-5 sm:p-6">
          <h2 className="text-lg font-black text-ink">Sports, spaces and pricing</h2>
          <p className="mt-2 text-sm text-muted">{courts.length} bookable space{courts.length === 1 ? '' : 's'} on this venue.</p>
          <ul className="mt-4 space-y-2">
            {courts.slice(0, 5).map((court) => (
              <li key={court.id} className="rounded-xl border border-line px-3 py-2 text-sm font-bold text-ink">
                {court.name} · {court.sportName || 'Sport'} · LKR {Number(court.hourlyRate || 0).toLocaleString('en-LK')}
              </li>
            ))}
          </ul>
          <Button className="!mt-5" component={Link} to={`/owner/venues/${venueId}/courts`} variant="outlined" startIcon={<Stadium />}>
            Manage spaces
          </Button>
        </article>
        <article className="surface-card p-5 sm:p-6">
          <h2 className="text-lg font-black text-ink">Booking and cancellation</h2>
          <p className="mt-2 text-sm text-muted">Business-wide cancellation deadline and refund rules apply to new bookings.</p>
          <Button className="!mt-5" component={Link} to={`/owner/venues/${venueId}/booking-policy`} variant="outlined" startIcon={<Policy />}>
            Booking policy
          </Button>
        </article>
      </OwnerSection>
    </OwnerPage>
  );
}

export default function OwnerVenueEditPage() {
  const { venueId } = useParams();
  const venueQuery = useOwnerVenue(venueId);
  const hoursQuery = useQuery({
    queryKey: ['owner', 'venues', venueId, 'hours'],
    queryFn: async () => unwrap(await ownerVenuesApi.getOperatingHours(venueId)),
    enabled: Boolean(venueId),
  });

  if (venueQuery.isLoading || hoursQuery.isLoading) {
    return (
      <OwnerPage>
        <Skeleton variant="rounded" height={48} className="!max-w-md" />
        <Skeleton variant="rounded" height={220} className="!mt-6" />
        <Skeleton variant="rounded" height={320} className="!mt-4" />
      </OwnerPage>
    );
  }

  if (venueQuery.isError || !venueQuery.data) {
    return (
      <OwnerPage>
        <OwnerPageHeader
          eyebrow="Venue settings"
          title="Venue not found"
          description="This venue is unavailable or you do not have access."
          actions={<Button component={Link} to="/owner" startIcon={<ArrowBack />}>Back to overview</Button>}
        />
      </OwnerPage>
    );
  }

  return (
    <VenueEditor
      key={venueId}
      venueId={venueId}
      venue={venueQuery.data}
      initialHours={hoursQuery.data}
    />
  );
}
