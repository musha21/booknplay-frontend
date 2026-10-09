import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getAllSports } from '../../api/public';
import ownerVenuesApi from '../../api/ownerVenues';
import { useOwnerCourts, useOwnerSubscription } from '../../hooks/useOwner';
import { resourceLabelForCourt, resourceLabelForSport } from '../../utils/courtResource';
import {
  canCreateCourt,
  formatLimitCount,
  isOwnerSubscriptionsEnabled,
  planLimitMessage,
  resolvePlanLimits,
} from '../../utils/subscription';

export default function OwnerCourtsPage() {
  const { venueId } = useParams();
  const { data: courts = [], refetch } = useOwnerCourts(venueId);
  const { data: subscription } = useOwnerSubscription();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sportId: '', hourlyRate: '2500' });

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
  const selectedSport = (sportsQuery.data || []).find((sport) => String(sport.id) === String(form.sportId));
  const formResourceLabel = resourceLabelForSport(selectedSport?.name);

  const createCourt = async () => {
    try {
      await ownerVenuesApi.createCourt(venueId, { ...form, hourlyRate: Number(form.hourlyRate) });
      toast.success(formResourceLabel + ' added');
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(planLimitMessage(err, 'Could not create ' + formResourceLabel.toLowerCase()));
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
            <Button variant="contained" onClick={() => setOpen(true)}>Add space</Button>
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
            <Button className="!mt-4" variant="contained" color="secondary" onClick={() => setOpen(true)}>
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
                  {resourceLabelForCourt(court)} · {court.sportName} · LKR {court.hourlyRate} / hour · {court.status}
                </Typography>
              </div>
              <Button
                component={Link}
                to={`/owner/pricing?venueId=${venueId}&courtId=${court.id}`}
                variant="outlined"
              >
                Set pricing
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>New {formResourceLabel.toLowerCase()}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField label={formResourceLabel + ' name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField select label="Sport" value={form.sportId} onChange={(e) => setForm({ ...form, sportId: e.target.value })}>
            {(sportsQuery.data || []).map((sport) => (
              <MenuItem key={sport.id} value={sport.id}>{sport.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Hourly rate" type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createCourt}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
