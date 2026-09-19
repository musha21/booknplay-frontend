import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, LinearProgress, Stack, Switch, TextField, Typography,
} from '@mui/material';
import {
  Add, Casino, Pool, SportsBasketball, SportsCricket, SportsSoccer, SportsTennis,
  SportsVolleyball,
} from '@mui/icons-material';
import { toast } from 'sonner';
import LocationPicker from '../../components/owner/LocationPicker';
import { onboardVenue } from '../../api/ownerVenues';
import useAuthStore from '../../stores/authStore';

const STEPS = ['Sports', 'Location', 'Hours', 'Pricing', 'Amenities', 'Rules', 'Preview'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const SPORT_CATALOG = [
  { name: 'Indoor Cricket', resource: 'Court', icon: <SportsCricket /> },
  { name: 'Badminton', resource: 'Court', icon: <SportsTennis /> },
  { name: 'Futsal / Indoor Football', resource: 'Pitch', icon: <SportsSoccer /> },
  { name: 'Basketball', resource: 'Court', icon: <SportsBasketball /> },
  { name: 'Volleyball', resource: 'Court', icon: <SportsVolleyball /> },
  { name: 'Table Tennis', resource: 'Table', icon: <SportsTennis /> },
  { name: 'Squash', resource: 'Court', icon: <SportsTennis /> },
  { name: 'Padel', resource: 'Court', icon: <SportsTennis /> },
  { name: '8-Ball Pool', resource: 'Pool Table', icon: <Casino /> },
  { name: 'Swimming', resource: 'Lane', icon: <Pool /> },
];
const AMENITIES = [
  'Parking', 'Changing Room', 'Shower', 'Washroom', 'Drinking Water', 'Wi-Fi',
  'Cafe', 'Equipment Rental', 'Flood Lights', 'Seating Area', 'First Aid', 'Air Conditioning',
];
const RULES = [
  'No smoking', 'No outside food', 'Sports shoes required', 'ID required', 'Arrive 10 minutes early', 'No pets',
];

const defaultHours = () => DAYS.map((day) => ({
  dayOfWeek: day,
  openTime: '06:00',
  closeTime: '23:00',
  closed: false,
}));

const letterNames = (resource, quantity) =>
  Array.from({ length: quantity }, (_, i) => `${resource} ${String.fromCharCode(65 + i)}`);

export default function OwnerOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessName = useAuthStore((state) => state.owner?.businessName);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [hours, setHours] = useState(defaultHours());
  const [pricing, setPricing] = useState({});
  const [amenities, setAmenities] = useState([]);
  const [rules, setRules] = useState([]);
  const [additionalRules, setAdditionalRules] = useState('');
  const [dialogSport, setDialogSport] = useState(null);
  const [dialogQty, setDialogQty] = useState(1);
  const [customSportOpen, setCustomSportOpen] = useState(false);
  const [customSport, setCustomSport] = useState({ name: '', resource: 'Court' });

  const venueType = facilities.length > 1 ? 'Multi-sport' : (facilities[0]?.sportName || '');
  const displayedSports = [
    ...SPORT_CATALOG,
    ...facilities
      .filter((facility) => !SPORT_CATALOG.some((sport) => sport.name === facility.sportName))
      .map((facility) => ({ name: facility.sportName, resource: facility.resource, icon: <SportsTennis /> })),
  ];
  const startingPrice = useMemo(() => {
    const prices = Object.values(pricing).map((p) => Number(p.price)).filter((n) => n > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [pricing]);

  const openSportDialog = (sport) => {
    const existing = facilities.find((f) => f.sportName === sport.name);
    setDialogQty(existing?.quantity || 1);
    setDialogSport(sport);
  };

  const confirmSportQuantity = () => {
    if (!dialogSport) return;
    const quantity = Math.max(1, Number(dialogQty) || 1);
    const courtNames = letterNames(dialogSport.resource, quantity);
    setFacilities((prev) => {
      const next = prev.filter((f) => f.sportName !== dialogSport.name);
      return [...next, { sportName: dialogSport.name, resource: dialogSport.resource, quantity, courtNames }];
    });
    setPricing((prev) => ({
      ...prev,
      [dialogSport.name]: prev[dialogSport.name] || { price: '1500', durationMinutes: 60 },
    }));
    setDialogSport(null);
  };

  const removeSport = () => {
    if (!dialogSport) return;
    setFacilities((prev) => prev.filter((f) => f.sportName !== dialogSport.name));
    setDialogSport(null);
  };

  const addCustomSport = () => {
    const name = customSport.name.trim();
    const resource = customSport.resource.trim() || 'Court';
    if (!name) return;
    if (SPORT_CATALOG.some((sport) => sport.name.toLowerCase() === name.toLowerCase())) {
      setError(`${name} is already available in the sport list`);
      return;
    }
    if (facilities.some((facility) => facility.sportName.toLowerCase() === name.toLowerCase())) {
      setError(`${name} has already been added`);
      return;
    }
    setError('');
    setCustomSportOpen(false);
    setCustomSport({ name: '', resource: 'Court' });
    openSportDialog({ name, resource, icon: <SportsTennis /> });
  };

  const validate = () => {
    if (step === 0 && facilities.length === 0) return 'Select at least one sport';
    if (step === 0 && facilities.some((f) => !f.quantity || f.quantity < 1)) return 'Each sport needs at least 1 court';
    if (step === 1 && (!location?.formattedAddress || location.latitude == null)) return 'Select a map location';
    if (step === 3 && facilities.some((f) => !Number(pricing[f.sportName]?.price))) return 'Set a price for each sport';
    return '';
  };

  const next = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const applySameHours = () => {
    const first = hours[0];
    setHours(DAYS.map((day) => ({ ...first, dayOfWeek: day })));
  };

  const submit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onboardVenue({
        venueType,
        description,
        formattedAddress: location.formattedAddress,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        facilities: facilities.map((f) => ({
          sportName: f.sportName,
          quantity: f.quantity,
          courtNames: f.courtNames,
          price: Number(pricing[f.sportName]?.price || 0),
          durationMinutes: Number(pricing[f.sportName]?.durationMinutes || 60),
        })),
        hours: hours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          closed: h.closed,
          openTime: h.openTime?.length === 5 ? `${h.openTime}:00` : h.openTime,
          closeTime: h.closeTime?.length === 5 ? `${h.closeTime}:00` : h.closeTime,
        })),
        amenities,
        rulePresets: rules,
        additionalRules,
      });
      toast.success('Venue is live on the landing page');
      await queryClient.invalidateQueries({ queryKey: ['venues'] });
      await queryClient.invalidateQueries({ queryKey: ['sports'] });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'venues'] });
      navigate('/owner');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Your signed-in account is not allowed to create venues. Sign out and sign in with a business-owner account.');
      } else {
        setError(err.response?.data?.message || 'Could not create venue');
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedSport = dialogSport
    ? facilities.find((f) => f.sportName === dialogSport.name)
    : null;

  return (
    <Box className="mx-auto max-w-5xl surface-card p-5 sm:p-8">
      <Typography variant="overline" color="text.secondary">Step {step + 1} of {STEPS.length}</Typography>
      <LinearProgress variant="determinate" value={((step + 1) / STEPS.length) * 100} className="!mb-3 !rounded-full" />
      <Stack direction="row" spacing={1} className="mb-6 overflow-x-auto">
        {STEPS.map((label, i) => (
          <Chip key={label} size="small" label={label} color={i === step ? 'primary' : 'default'} variant={i <= step ? 'filled' : 'outlined'} />
        ))}
      </Stack>
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {step === 0 && (
        <Stack spacing={2}>
          <Typography variant="h4">Which sports can customers book?</Typography>
          <Typography color="text.secondary">Select every sport you offer. Each click asks how many courts, pitches, or tables to create (named A, B, C…).</Typography>
          <Box className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {displayedSports.map((sport) => {
              const selected = facilities.find((f) => f.sportName === sport.name);
              return (
                <Card key={sport.name} variant="outlined" className={`h-full transition-colors ${selected ? '!border-2 !border-lime-500 !bg-lime-50 dark:!bg-lime-950/20' : ''}`}>
                  <CardActionArea onClick={() => openSportDialog(sport)} className="!h-full">
                    <CardContent className="flex min-h-44 flex-col items-center justify-center !p-4 text-center">
                      <Box className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${selected ? 'bg-lime-300 text-navy-900' : 'bg-slate-100 text-muted dark:bg-navy-800'}`}>{sport.icon}</Box>
                      <Typography variant="body2" fontWeight={700} className="min-h-10 content-center">{sport.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{sport.resource}</Typography>
                      <Box className="mt-2 flex h-6 items-center">
                        {selected && <Chip size="small" color="secondary" label={`${selected.quantity} ${sport.resource}${selected.quantity === 1 ? '' : 's'}`} />}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
            <Card variant="outlined" className="h-full !border-dashed">
              <CardActionArea onClick={() => setCustomSportOpen(true)} className="!h-full">
                <CardContent className="flex min-h-44 flex-col items-center justify-center !p-4 text-center">
                  <Box className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-muted dark:bg-navy-800"><Add /></Box>
                  <Typography variant="body2" fontWeight={700}>Add another sport</Typography>
                  <Typography variant="caption" color="text.secondary">Not listed above</Typography>
                  <Box className="mt-2 h-6" />
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <TextField label="Short Description" multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Stack>
      )}

      {step === 1 && (
        <Stack spacing={2}>
          <Typography variant="h4">Where is your venue?</Typography>
          <LocationPicker value={location} onChange={setLocation} />
        </Stack>
      )}

      {step === 2 && (
        <Stack spacing={2}>
          <Typography variant="h4">When can customers book?</Typography>
          <Button onClick={applySameHours}>Use same hours for all days</Button>
          {hours.map((row, idx) => (
            <Stack key={row.dayOfWeek} direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Typography sx={{ minWidth: 110 }}>{row.dayOfWeek}</Typography>
              <Switch checked={!row.closed} onChange={(e) => {
                const next = [...hours];
                next[idx] = { ...row, closed: !e.target.checked };
                setHours(next);
              }} />
              <TextField type="time" label="Open" value={row.openTime} disabled={row.closed} onChange={(e) => {
                const next = [...hours];
                next[idx] = { ...row, openTime: e.target.value };
                setHours(next);
              }} />
              <TextField type="time" label="Close" value={row.closeTime} disabled={row.closed} onChange={(e) => {
                const next = [...hours];
                next[idx] = { ...row, closeTime: e.target.value };
                setHours(next);
              }} />
            </Stack>
          ))}
        </Stack>
      )}

      {step === 3 && (
        <Stack spacing={2}>
          <Typography variant="h4">Set your pricing</Typography>
          {facilities.map((f) => (
            <Card key={f.sportName} className="p-4">
              <Typography fontWeight={700}>{f.sportName}</Typography>
              <Typography variant="caption">{f.courtNames.join(', ')}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="mt-2">
                <TextField label="Price (LKR)" type="number" value={pricing[f.sportName]?.price || ''} onChange={(e) => setPricing({ ...pricing, [f.sportName]: { ...pricing[f.sportName], price: e.target.value } })} />
                <TextField label="Duration (minutes)" type="number" value={pricing[f.sportName]?.durationMinutes || 60} onChange={(e) => setPricing({ ...pricing, [f.sportName]: { ...pricing[f.sportName], durationMinutes: e.target.value } })} />
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {step === 4 && (
        <Stack spacing={2}>
          <Typography variant="h4">What does your venue offer?</Typography>
          <Box className="flex flex-wrap gap-2">
            {AMENITIES.map((item) => (
              <Chip key={item} label={item} color={amenities.includes(item) ? 'secondary' : 'default'} onClick={() => setAmenities((prev) => prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item])} />
            ))}
          </Box>
        </Stack>
      )}

      {step === 5 && (
        <Stack spacing={2}>
          <Typography variant="h4">Set venue rules</Typography>
          <Box className="flex flex-wrap gap-2">
            {RULES.map((item) => (
              <Chip key={item} label={item} color={rules.includes(item) ? 'primary' : 'default'} onClick={() => setRules((prev) => prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item])} />
            ))}
          </Box>
          <TextField label="Additional rules" multiline minRows={3} value={additionalRules} onChange={(e) => setAdditionalRules(e.target.value)} />
        </Stack>
      )}

      {step === 6 && (
        <Card className="p-6">
          <Typography variant="h4">{businessName && venueType ? `${businessName} - ${venueType}` : venueType || 'Your venue'}</Typography>
          <Typography className="!mt-1">📍 {location?.formattedAddress}</Typography>
          <Typography className="!mt-2">{facilities.map((f) => f.sportName).join(' · ')}</Typography>
          <Chip label="Live" color="success" className="!mt-2" />
          <Typography variant="h6" className="!mt-4">From LKR {startingPrice ? Number(startingPrice).toLocaleString() : '—'} / hour</Typography>
          <Typography variant="subtitle2" className="!mt-4">Facilities</Typography>
          {facilities.flatMap((f) => f.courtNames.map((c, i) => (
            <Typography key={`${f.sportName}-${i}`} variant="body2">• {f.sportName}: {c}</Typography>
          )))}
          <Typography variant="subtitle2" className="!mt-3">Amenities</Typography>
          <Typography variant="body2">{amenities.join(', ') || 'None yet'}</Typography>
          <Typography variant="subtitle2" className="!mt-3">Opening hours</Typography>
          <Typography variant="body2">{hours.find((h) => !h.closed)?.openTime} — {hours.find((h) => !h.closed)?.closeTime}</Typography>
        </Card>
      )}

      <Box className="mt-6 flex justify-between">
        <Button disabled={step === 0 || saving} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < STEPS.length - 1 ? (
          <Button variant="contained" onClick={next}>Continue</Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setStep(0)}>Edit</Button>
            <Button variant="contained" disabled={saving} onClick={submit}>{saving ? 'Creating…' : 'Create Venue'}</Button>
          </Stack>
        )}
      </Box>

      <Dialog open={Boolean(dialogSport)} onClose={() => setDialogSport(null)} fullWidth maxWidth="xs">
        <DialogTitle>{dialogSport?.name}</DialogTitle>
        <DialogContent>
          <Typography className="!mb-3" color="text.secondary">
            How many {dialogSport?.resource?.toLowerCase()}s should customers be able to book?
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label={`Number of ${dialogSport?.resource}s`}
            inputProps={{ min: 1, max: 26 }}
            value={dialogQty}
            onChange={(e) => setDialogQty(Math.max(1, Number(e.target.value) || 1))}
          />
          {dialogQty > 0 && dialogSport && (
            <Typography variant="body2" className="!mt-3" color="text.secondary">
              Names: {letterNames(dialogSport.resource, Math.max(1, Number(dialogQty) || 1)).join(', ')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {selectedSport && <Button color="error" onClick={removeSport}>Remove</Button>}
          <Button onClick={() => setDialogSport(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmSportQuantity}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={customSportOpen} onClose={() => setCustomSportOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add another sport</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField autoFocus label="Sport name" placeholder="e.g. Pickleball" value={customSport.name} onChange={(e) => setCustomSport({ ...customSport, name: e.target.value })} />
          <TextField label="Facility type" placeholder="e.g. Court, Pitch, Table" value={customSport.resource} onChange={(e) => setCustomSport({ ...customSport, resource: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomSportOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!customSport.name.trim()} onClick={addCustomSport}>Continue</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
