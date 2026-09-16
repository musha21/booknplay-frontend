import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getAllSports } from '../../api/public';
import ownerVenuesApi from '../../api/ownerVenues';
import { useOwnerCourts } from '../../hooks/useOwner';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function OwnerCourtsPage() {
  const { venueId } = useParams();
  const { data: courts = [], refetch } = useOwnerCourts(venueId);
  const [open, setOpen] = useState(false);
  const [pricingCourt, setPricingCourt] = useState(null);
  const [form, setForm] = useState({ name: '', sportId: '', hourlyRate: '2500' });
  const [rules, setRules] = useState([]);

  const sportsQuery = useQuery({
    queryKey: ['public', 'sports'],
    queryFn: async () => {
      const res = await getAllSports();
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const createCourt = async () => {
    try {
      await ownerVenuesApi.createCourt(venueId, { ...form, hourlyRate: Number(form.hourlyRate) });
      toast.success('Court added');
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create court');
    }
  };

  const openPricing = async (court) => {
    const res = await ownerVenuesApi.getPricing(court.id);
    const existing = res.data?.data || [];
    setPricingCourt(court);
    setRules(existing.length ? existing : DAYS.map((day) => ({
      dayOfWeek: day,
      startTime: '06:00:00',
      endTime: '22:00:00',
      price: court.hourlyRate,
    })));
  };

  const savePricing = async () => {
    try {
      await ownerVenuesApi.replacePricing(pricingCourt.id, rules);
      toast.success('Pricing saved');
      setPricingCourt(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save pricing');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" className="mb-4">
        <Typography variant="h4">Courts</Typography>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to={`/owner/venues/${venueId}/calendar`}>Calendar</Button>
          <Button variant="contained" onClick={() => setOpen(true)}>Add court</Button>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        {courts.map((court) => (
          <Card key={court.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <Typography variant="h6">{court.name}</Typography>
                <Typography variant="body2">{court.sportName} · LKR {court.hourlyRate} / hour · {court.status}</Typography>
              </div>
              <Button onClick={() => openPricing(court)}>Peak / off-peak pricing</Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>New court</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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

      <Dialog open={Boolean(pricingCourt)} onClose={() => setPricingCourt(null)} fullWidth maxWidth="md">
        <DialogTitle>Pricing grid — {pricingCourt?.name}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          {rules.map((rule, idx) => (
            <Stack key={`${rule.dayOfWeek}-${idx}`} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField select label="Day" value={rule.dayOfWeek} onChange={(e) => {
                const next = [...rules];
                next[idx] = { ...rule, dayOfWeek: e.target.value };
                setRules(next);
              }} sx={{ minWidth: 140 }}>
                {DAYS.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
              </TextField>
              <TextField type="time" label="Start" value={String(rule.startTime).slice(0, 5)} onChange={(e) => {
                const next = [...rules];
                next[idx] = { ...rule, startTime: `${e.target.value}:00` };
                setRules(next);
              }} />
              <TextField type="time" label="End" value={String(rule.endTime).slice(0, 5)} onChange={(e) => {
                const next = [...rules];
                next[idx] = { ...rule, endTime: `${e.target.value}:00` };
                setRules(next);
              }} />
              <TextField type="number" label="Price" value={rule.price} onChange={(e) => {
                const next = [...rules];
                next[idx] = { ...rule, price: Number(e.target.value) };
                setRules(next);
              }} />
            </Stack>
          ))}
          <Button onClick={() => setRules([...rules, { dayOfWeek: 'SATURDAY', startTime: '18:00:00', endTime: '22:00:00', price: 3500 }])}>
            Add weekend / peak band
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPricingCourt(null)}>Cancel</Button>
          <Button variant="contained" onClick={savePricing}>Save pricing</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
