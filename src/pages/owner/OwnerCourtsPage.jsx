import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllSports } from '../../api/public';
import ownerVenuesApi from '../../api/ownerVenues';
import { useOwnerCourts, useOwnerSubscription } from '../../hooks/useOwner';
import { resourceLabelForCourt, resourceLabelForSport } from '../../utils/courtResource';
import { facilityLabel } from '../../utils/venue';
import {
  canCreateCourt,
  formatLimitCount,
  isOwnerSubscriptionsEnabled,
  planLimitMessage,
  resolvePlanLimits,
} from '../../utils/subscription';

const NEW_SPORT_ID = '__new__';
const EMPTY_FORM = { name: '', sportId: '', sportName: '', facilityType: '', hourlyRate: '2500' };

export default function OwnerCourtsPage() {
  const { venueId } = useParams();
  const queryClient = useQueryClient();
  const { data: courts = [], refetch } = useOwnerCourts(venueId);
  const { data: subscription } = useOwnerSubscription();
  const [open, setOpen] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [facilityError, setFacilityError] = useState(false);

  const subscriptionsEnabled = isOwnerSubscriptionsEnabled();
  const limits = resolvePlanLimits(subscription);
  const canAdd = !subscriptionsEnabled || canCreateCourt(subscription, courts.length);

  const sportsQuery = useQuery({
    queryKey: ['public', 'sports'],
    queryFn: async () => {
      const res = await getAllSports();
      return Array.isArray(res) ? res : (res?.data || res?.content || []);
    },
  });
  const isNewSport = form.sportId === NEW_SPORT_ID;
  const selectedSport = (sportsQuery.data || []).find((sport) => String(sport.id) === String(form.sportId));
  const formResourceLabel = resourceLabelForSport(isNewSport ? form.sportName : selectedSport?.name);

  const openCreate = () => {
    setEditingCourtId(null);
    setForm(EMPTY_FORM);
    setFacilityError(false);
    setOpen(true);
  };

  const openEdit = (court) => {
    setEditingCourtId(court.id);
    setForm({
      name: court.name || '',
      sportId: court.sportId || '',
      sportName: '',
      facilityType: court.facilityType || '',
      hourlyRate: String(court.hourlyRate ?? '2500'),
    });
    setFacilityError(false);
    setOpen(true);
  };

  const submitCourt = async () => {
    if (isNewSport && !form.sportName.trim()) {
      toast.error('Enter a name for the new sport');
      return;
    }
    if (!form.facilityType) {
      setFacilityError(true);
      toast.error('Please select Indoor or Outdoor.');
      return;
    }
    const payload = isNewSport
      ? { name: form.name, sportName: form.sportName.trim(), facilityType: form.facilityType, hourlyRate: Number(form.hourlyRate) }
      : { name: form.name, sportId: form.sportId, facilityType: form.facilityType, hourlyRate: Number(form.hourlyRate) };
    try {
      if (editingCourtId) {
        await ownerVenuesApi.updateCourt(editingCourtId, payload);
        toast.success(formResourceLabel + ' updated');
      } else {
        await ownerVenuesApi.createCourt(venueId, payload);
        toast.success(formResourceLabel + ' added');
      }
      setOpen(false);
      setEditingCourtId(null);
      setForm(EMPTY_FORM);
      refetch();
      // Surface a newly created sport in the global filters without a manual step.
      queryClient.invalidateQueries({ queryKey: ['public', 'sports'] });
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    } catch (err) {
      toast.error(planLimitMessage(err, 'Could not save ' + formResourceLabel.toLowerCase()));
    }
  };

  return (
    <Box className="mx-auto max-w-6xl">
      <Stack direction="row" justifyContent="space-between" className="mb-4">
        <div>
          <Typography variant="h4">Bookable spaces</Typography>
          {subscriptionsEnabled && (
            <Typography variant="body2" color="text.secondary" className="!mt-1">
              {courts.length} used · {formatLimitCount(limits.maxCourtsPerVenue)} per venue on your plan
            </Typography>
          )}
        </div>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to={`/owner/venues/${venueId}/calendar`}>Calendar</Button>
          <Button component={Link} to={`/owner/pricing?venueId=${venueId}`}>Pricing</Button>
          {canAdd ? (
            <Button variant="contained" onClick={openCreate}>Add space</Button>
          ) : (
            <Button component={Link} to="/owner/billing" variant="contained" color="secondary">
              Upgrade to add spaces
            </Button>
          )}
        </Stack>
      </Stack>

      <div className="mb-6 rounded-2xl border border-line bg-canvas/50 p-4 sm:p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">How it works</p>
        <ol className="mt-3 grid gap-2 text-sm text-ink sm:grid-cols-5">
          {[
            'Venue',
            'Bookable space',
            'Pricing',
            'Calendar slots',
            'Walk-in / bookings',
          ].map((step, index) => (
            <li key={step} className="rounded-xl border border-line bg-surface px-3 py-2">
              <span className="text-[10px] font-extrabold text-muted">Step {index + 1}</span>
              <strong className="mt-1 block">{step}</strong>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-muted">
          A bookable space is the court, pitch, table, or lane customers reserve. Add one, then set Normal, Peak, and Weekend rates on Pricing.
        </p>
      </div>

      {!courts.length && (
        <div className="mb-6 rounded-2xl border border-dashed border-line p-6 text-center">
          <p className="text-lg font-black text-ink">Add your first bookable space</p>
          <p className="mt-2 text-sm text-muted">
            Without a space, the calendar has nothing to sell. Create one space, then configure pricing.
          </p>
          {canAdd && (
            <Button className="!mt-4" variant="contained" color="secondary" onClick={openCreate}>
              Add space
            </Button>
          )}
        </div>
      )}

      <Stack spacing={2}>
        {courts.map((court) => (
          <Card key={court.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Typography variant="h6">{court.name}</Typography>
                <Typography variant="body2">
                  {resourceLabelForCourt(court)} · {court.sportName}
                  {court.facilityType ? ` · ${facilityLabel(court.facilityType)}` : ' · Facility not set'}
                  {' · LKR '}{court.hourlyRate} / hour · {court.status}
                </Typography>
              </div>
              <Stack direction="row" spacing={1}>
                <Button variant="text" onClick={() => openEdit(court)}>Edit</Button>
                <Button
                  component={Link}
                  to={`/owner/pricing?venueId=${venueId}&courtId=${court.id}`}
                  variant="outlined"
                >
                  Set pricing
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editingCourtId ? `Edit ${formResourceLabel.toLowerCase()}` : `New ${formResourceLabel.toLowerCase()}`}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField label={formResourceLabel + ' name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField select label="Sport" value={form.sportId} onChange={(e) => setForm({ ...form, sportId: e.target.value })}>
            {(sportsQuery.data || []).map((sport) => (
              <MenuItem key={sport.id} value={sport.id}>{sport.name}</MenuItem>
            ))}
            <MenuItem value={NEW_SPORT_ID}>+ Create new sport</MenuItem>
          </TextField>
          {isNewSport && (
            <TextField
              label="New sport name"
              placeholder="e.g. Carrom"
              value={form.sportName}
              onChange={(e) => setForm({ ...form, sportName: e.target.value })}
              helperText="Adds this sport to the platform filters once created"
            />
          )}
          <TextField
            select
            label="Facility"
            value={form.facilityType}
            error={facilityError && !form.facilityType}
            helperText={facilityError && !form.facilityType ? 'Please select Indoor or Outdoor.' : 'Is this space indoor or outdoor?'}
            onChange={(e) => { setForm({ ...form, facilityType: e.target.value }); if (e.target.value) setFacilityError(false); }}
          >
            <MenuItem value="" disabled>Select indoor or outdoor</MenuItem>
            <MenuItem value="INDOOR">Indoor</MenuItem>
            <MenuItem value="OUTDOOR">Outdoor</MenuItem>
          </TextField>
          <TextField label="Hourly rate" type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitCourt}>{editingCourtId ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
