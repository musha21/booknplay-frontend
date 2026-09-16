import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, IconButton, LinearProgress,
  Stack, Switch, TextField, Typography,
} from '@mui/material';
import {
  Add, Remove, SportsSoccer, SportsTennis, SportsCricket, Pool, Stadium, SportsBasketball,
} from '@mui/icons-material';
import { toast } from 'sonner';
import LocationPicker from '../../components/owner/LocationPicker';
import { onboardVenue } from '../../api/ownerVenues';

const STEPS = ['Basic', 'Location', 'Facilities', 'Hours', 'Pricing', 'Amenities', 'Rules', 'Preview'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const VENUE_TYPES = [
  { name: 'Football', icon: <SportsSoccer /> },
  { name: 'Badminton', icon: <SportsTennis /> },
  { name: 'Cricket', icon: <SportsCricket /> },
  { name: 'Tennis', icon: <SportsTennis /> },
  { name: 'Swimming', icon: <Pool /> },
  { name: 'Event Hall', icon: <Stadium /> },
  { name: 'Indoor Sports', icon: <SportsBasketball /> },
  { name: 'Other', icon: <Stadium /> },
];
const FACILITIES = [
  'Football Field', 'Badminton Court', 'Cricket Ground', 'Tennis Court',
  'Swimming Pool', 'Basketball Court', 'Volleyball Court', 'Indoor Sports', 'Event Space',
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

export default function OwnerOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [basic, setBasic] = useState({ name: '', venueType: '', description: '' });
  const [location, setLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [hours, setHours] = useState(defaultHours());
  const [pricing, setPricing] = useState({});
  const [amenities, setAmenities] = useState([]);
  const [rules, setRules] = useState([]);
  const [additionalRules, setAdditionalRules] = useState('');

  const startingPrice = useMemo(() => {
    const prices = Object.values(pricing).map((p) => Number(p.price)).filter((n) => n > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [pricing]);

  const toggleFacility = (name) => {
    setFacilities((prev) => {
      const exists = prev.find((f) => f.sportName === name);
      if (exists) return prev.filter((f) => f.sportName !== name);
      return [...prev, { sportName: name, quantity: 1, courtNames: [`${name} 1`] }];
    });
    setPricing((prev) => ({
      ...prev,
      [name]: prev[name] || { price: '1500', durationMinutes: 60 },
    }));
  };

  const updateQuantity = (name, delta) => {
    setFacilities((prev) => prev.map((f) => {
      if (f.sportName !== name) return f;
      const quantity = Math.max(1, f.quantity + delta);
      const courtNames = Array.from({ length: quantity }, (_, i) => f.courtNames[i] || `${name} ${i + 1}`);
      return { ...f, quantity, courtNames };
    }));
  };

  const validate = () => {
    if (step === 0 && (!basic.name.trim() || !basic.venueType)) return 'Venue name and type are required';
    if (step === 1 && (!location?.formattedAddress || location.latitude == null)) return 'Select a map location';
    if (step === 2 && facilities.length === 0) return 'Select at least one facility';
    if (step === 4 && facilities.some((f) => !Number(pricing[f.sportName]?.price))) return 'Set a price for each facility';
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
        name: basic.name,
        venueType: basic.venueType,
        description: basic.description,
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
      toast.success('Venue submitted for approval');
      navigate('/owner');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create venue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">Step {step + 1} of 8</Typography>
      <LinearProgress variant="determinate" value={((step + 1) / 8) * 100} className="!mb-3 !rounded-full" />
      <Stack direction="row" spacing={1} className="mb-6 overflow-x-auto">
        {STEPS.map((label, i) => (
          <Chip key={label} size="small" label={label} color={i === step ? 'primary' : 'default'} variant={i <= step ? 'filled' : 'outlined'} />
        ))}
      </Stack>
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {step === 0 && (
        <Stack spacing={2}>
          <Typography variant="h4">Create Your Venue</Typography>
          <Typography color="text.secondary">Let's get your venue ready for bookings.</Typography>
          <TextField label="Venue Name" required value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} />
          <Typography variant="subtitle2">Venue Type</Typography>
          <Box className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {VENUE_TYPES.map((type) => (
              <Card key={type.name} variant={basic.venueType === type.name ? 'elevation' : 'outlined'} className={basic.venueType === type.name ? '!border-2 !border-lime-500' : ''}>
                <CardActionArea onClick={() => setBasic({ ...basic, venueType: type.name })}>
                  <CardContent className="text-center">
                    {type.icon}
                    <Typography variant="body2" fontWeight={700}>{type.name}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
          <TextField label="Short Description" multiline minRows={3} value={basic.description} onChange={(e) => setBasic({ ...basic, description: e.target.value })} />
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
          <Typography variant="h4">What can customers book?</Typography>
          <Box className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FACILITIES.map((name) => {
              const selected = facilities.find((f) => f.sportName === name);
              return (
                <Card key={name} variant={selected ? 'elevation' : 'outlined'}>
                  <CardActionArea onClick={() => toggleFacility(name)}>
                    <CardContent>
                      <Typography fontWeight={700}>{name}</Typography>
                    </CardContent>
                  </CardActionArea>
                  {selected && (
                    <Box className="px-3 pb-3">
                      <Typography variant="caption">Number of courts</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton size="small" onClick={() => updateQuantity(name, -1)}><Remove /></IconButton>
                        <Typography>{selected.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(name, 1)}><Add /></IconButton>
                      </Stack>
                      {selected.courtNames.map((court, idx) => (
                        <TextField
                          key={`${name}-${idx}`}
                          size="small"
                          fullWidth
                          className="!mt-1"
                          value={court}
                          onChange={(e) => {
                            setFacilities((prev) => prev.map((f) => {
                              if (f.sportName !== name) return f;
                              const courtNames = [...f.courtNames];
                              courtNames[idx] = e.target.value;
                              return { ...f, courtNames };
                            }));
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Card>
              );
            })}
          </Box>
        </Stack>
      )}

      {step === 3 && (
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

      {step === 4 && (
        <Stack spacing={2}>
          <Typography variant="h4">Set your pricing</Typography>
          {facilities.map((f) => (
            <Card key={f.sportName} className="p-4">
              <Typography fontWeight={700}>{f.sportName}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="mt-2">
                <TextField label="Price (LKR)" type="number" value={pricing[f.sportName]?.price || ''} onChange={(e) => setPricing({ ...pricing, [f.sportName]: { ...pricing[f.sportName], price: e.target.value } })} />
                <TextField label="Duration (minutes)" type="number" value={pricing[f.sportName]?.durationMinutes || 60} onChange={(e) => setPricing({ ...pricing, [f.sportName]: { ...pricing[f.sportName], durationMinutes: e.target.value } })} />
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {step === 5 && (
        <Stack spacing={2}>
          <Typography variant="h4">What does your venue offer?</Typography>
          <Box className="flex flex-wrap gap-2">
            {AMENITIES.map((item) => (
              <Chip key={item} label={item} color={amenities.includes(item) ? 'secondary' : 'default'} onClick={() => setAmenities((prev) => prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item])} />
            ))}
          </Box>
        </Stack>
      )}

      {step === 6 && (
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

      {step === 7 && (
        <Card className="p-6">
          <Typography variant="h4">{basic.name || 'Your venue'}</Typography>
          <Typography className="!mt-1">📍 {location?.formattedAddress}</Typography>
          <Typography className="!mt-2">{basic.venueType} {facilities.map((f) => f.sportName).join(' · ')}</Typography>
          <Chip label="New Venue" className="!mt-2" />
          <Typography variant="h6" className="!mt-4">From LKR {startingPrice ? Number(startingPrice).toLocaleString() : '—'} / hour</Typography>
          <Typography variant="subtitle2" className="!mt-4">Facilities</Typography>
          {facilities.flatMap((f) => f.courtNames.map((c, i) => (
            <Typography key={`${f.sportName}-${i}`} variant="body2">• {c}</Typography>
          )))}
          <Typography variant="subtitle2" className="!mt-3">Amenities</Typography>
          <Typography variant="body2">{amenities.join(', ') || 'None yet'}</Typography>
          <Typography variant="subtitle2" className="!mt-3">Opening hours</Typography>
          <Typography variant="body2">{hours.find((h) => !h.closed)?.openTime} — {hours.find((h) => !h.closed)?.closeTime}</Typography>
        </Card>
      )}

      <Box className="mt-6 flex justify-between">
        <Button disabled={step === 0 || saving} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < 7 ? (
          <Button variant="contained" onClick={next}>Continue</Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setStep(0)}>Edit</Button>
            <Button variant="contained" disabled={saving} onClick={submit}>{saving ? 'Creating…' : 'Create Venue'}</Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
