import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { useOwnerCalendar, useOwnerCourts } from '../../hooks/useOwner';
import ownerCalendarApi from '../../api/ownerCalendar';

const slotColor = (slot) => {
  if (slot.available) return '#dcfce7';
  if (slot.reason === 'HELD') return '#fef9c3';
  if (slot.reason === 'BLOCKED' || slot.reason === 'MAINTENANCE') return '#e2e8f0';
  return '#fecaca';
};

export default function OwnerCalendarPage() {
  const { venueId } = useParams();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [tab, setTab] = useState(0);
  const [walkIn, setWalkIn] = useState(null);
  const { data: courts = [] } = useOwnerCourts(venueId);
  const { data: calendar, refetch } = useOwnerCalendar(venueId, date);

  const courtTabs = calendar?.courts || courts.map((c) => ({ courtId: c.id, courtName: c.name, slots: [] }));
  const selected = courtTabs[tab] || courtTabs[0];

  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD')),
    []
  );

  const submitWalkIn = async () => {
    try {
      await ownerCalendarApi.createWalkIn({
        courtId: selected.courtId,
        date,
        startTime: walkIn.startTime.length === 5 ? `${walkIn.startTime}:00` : walkIn.startTime,
        endTime: walkIn.endTime.length === 5 ? `${walkIn.endTime}:00` : walkIn.endTime,
        guestName: walkIn.guestName,
        guestPhone: walkIn.guestPhone,
      });
      toast.success('Walk-in booked');
      setWalkIn(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Walk-in failed');
    }
  };

  const blockSlot = async (slot) => {
    try {
      await ownerCalendarApi.addBlockedSlot(selected.courtId, {
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: 'Owner block',
      });
      toast.success('Slot blocked');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not block slot');
    }
  };

  const addMaintenance = async () => {
    try {
      await ownerCalendarApi.addMaintenance(selected.courtId, {
        startDateTime: `${date}T12:00:00`,
        endDateTime: `${date}T14:00:00`,
        description: 'Maintenance window',
      });
      toast.success('Maintenance added (12:00–14:00)');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add maintenance');
    }
  };

  return (
    <Box>
      <Typography variant="h4" className="!mb-4">Calendar</Typography>
      <Stack direction="row" spacing={1} className="mb-4 overflow-x-auto">
        {dates.map((d) => (
          <Chip
            key={d}
            label={dayjs(d).format('ddd D MMM')}
            color={d === date ? 'primary' : 'default'}
            onClick={() => setDate(d)}
          />
        ))}
      </Stack>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="!mb-4">
        {courtTabs.map((court) => (
          <Tab key={court.courtId} label={court.courtName} />
        ))}
      </Tabs>
      <Stack direction="row" spacing={1} className="mb-4">
        <Button variant="contained" onClick={() => setWalkIn({ guestName: '', guestPhone: '', startTime: '18:00', endTime: '19:00' })}>
          Walk-in booking
        </Button>
        <Button onClick={addMaintenance}>Add 12–2 maintenance</Button>
      </Stack>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(selected?.slots || []).map((slot) => (
          <button
            key={`${slot.startTime}-${slot.endTime}`}
            type="button"
            className="rounded-xl p-3 text-left border"
            style={{ background: slotColor(slot) }}
            onClick={() => slot.available && blockSlot(slot)}
          >
            <div className="font-semibold">{String(slot.startTime).slice(0, 5)}–{String(slot.endTime).slice(0, 5)}</div>
            <div className="text-xs">{slot.available ? `LKR ${slot.price}` : slot.reason}</div>
          </button>
        ))}
      </div>
      <Typography variant="caption" className="!mt-3 block text-slate-500">
        Green available, red booked, yellow held, grey blocked/maintenance. Click an available slot to block it.
      </Typography>

      <Dialog open={Boolean(walkIn)} onClose={() => setWalkIn(null)}>
        <DialogTitle>Walk-in booking</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField label="Guest name" value={walkIn?.guestName || ''} onChange={(e) => setWalkIn({ ...walkIn, guestName: e.target.value })} />
          <TextField label="Guest phone" value={walkIn?.guestPhone || ''} onChange={(e) => setWalkIn({ ...walkIn, guestPhone: e.target.value })} />
          <TextField type="time" label="Start" value={walkIn?.startTime || ''} onChange={(e) => setWalkIn({ ...walkIn, startTime: e.target.value })} />
          <TextField type="time" label="End" value={walkIn?.endTime || ''} onChange={(e) => setWalkIn({ ...walkIn, endTime: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWalkIn(null)}>Cancel</Button>
          <Button variant="contained" onClick={submitWalkIn}>Confirm cash booking</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
