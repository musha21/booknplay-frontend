import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Skeleton, TextField,
} from '@mui/material';
import {
  Add, ArrowBack, ArrowForward, Build, CalendarMonth, EventAvailable,
  LockClock, Stadium,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useOwnerCalendar, useOwnerCourts } from '../../hooks/useOwner';
import ownerCalendarApi from '../../api/ownerCalendar';
import EmptyState from '../../components/ui/EmptyState';
import { OwnerMetricCard, OwnerPageHeader } from '../../components/owner/OwnerDashboardUi';

const STATUS = {
  AVAILABLE: { label: 'Available', className: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-200' },
  BOOKED: { label: 'Booked', className: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/35 dark:text-rose-200' },
  HELD: { label: 'Held', className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-200' },
  BLOCKED: { label: 'Blocked', className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200' },
  MAINTENANCE: { label: 'Maintenance', className: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900 dark:bg-violet-950/35 dark:text-violet-200' },
};

const slotStatus = (slot) => slot.available ? 'AVAILABLE' : (slot.reason || 'BOOKED');
const timeLabel = (value) => String(value || '').slice(0, 5);
const slotKey = (slot) => `${slot.startTime}-${slot.endTime}`;
const slotLabel = (slot) => `${timeLabel(slot.startTime)}–${timeLabel(slot.endTime)}${String(slot.endTime) <= String(slot.startTime) ? ' +1' : ''}`;

export default function OwnerCalendarPage() {
  const { venueId } = useParams();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [rangeStart, setRangeStart] = useState(dayjs().startOf('day'));
  const [courtFilter, setCourtFilter] = useState('all');
  const [slotAction, setSlotAction] = useState(null);
  const [walkIn, setWalkIn] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const courtsQuery = useOwnerCourts(venueId);
  const calendarQuery = useOwnerCalendar(venueId, date);
  const courts = courtsQuery.data || [];
  const calendar = calendarQuery.data;

  const courtCalendars = calendar?.courts || courts.map((court) => ({
    courtId: court.id,
    courtName: court.name,
    sportName: court.sportName,
    slots: [],
  }));
  const effectiveCourtFilter = courtCalendars.some((court) => court.courtId === courtFilter) ? courtFilter : 'all';
  const visibleCourts = effectiveCourtFilter === 'all'
    ? courtCalendars
    : courtCalendars.filter((court) => court.courtId === effectiveCourtFilter);

  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => rangeStart.add(index, 'day').format('YYYY-MM-DD')),
    [rangeStart]
  );
  const timeRows = useMemo(() => {
    const seen = new Set();
    const rows = [];
    visibleCourts.forEach((court) => (court.slots || []).forEach((slot) => {
      const key = slotKey(slot);
      if (!seen.has(key)) { seen.add(key); rows.push(slot); }
    }));
    return rows;
  }, [visibleCourts]);

  const allSlots = courtCalendars.flatMap((court) => court.slots || []);
  const availableCount = allSlots.filter((slot) => slot.available).length;
  const bookedCount = allSlots.filter((slot) => !slot.available && ['BOOKED', 'HELD'].includes(slot.reason)).length;
  const unavailableCount = allSlots.filter((slot) => !slot.available && ['BLOCKED', 'MAINTENANCE'].includes(slot.reason)).length;
  const occupancy = allSlots.length ? Math.round(((allSlots.length - availableCount) / allSlots.length) * 100) : 0;

  const refresh = () => calendarQuery.refetch();

  const openWalkIn = (court, slot) => {
    setSlotAction(null);
    setWalkIn({
      courtId: court.courtId,
      courtName: court.courtName,
      guestName: '', guestPhone: '',
      startTime: timeLabel(slot.startTime), endTime: timeLabel(slot.endTime),
    });
  };

  const submitWalkIn = async () => {
    try {
      await ownerCalendarApi.createWalkIn({
        courtId: walkIn.courtId,
        date,
        startTime: `${walkIn.startTime}:00`,
        endTime: `${walkIn.endTime}:00`,
        guestName: walkIn.guestName,
        guestPhone: walkIn.guestPhone,
      });
      toast.success('Walk-in booking created');
      setWalkIn(null);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Walk-in booking failed');
    }
  };

  const blockSlot = async () => {
    const { court, slot } = slotAction;
    try {
      await ownerCalendarApi.addBlockedSlot(court.courtId, {
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: 'Owner block',
      });
      toast.success('Time blocked');
      setSlotAction(null);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not block this time');
    }
  };

  const openMaintenance = () => setMaintenance({
    courtId: effectiveCourtFilter === 'all' ? courtCalendars[0]?.courtId || '' : effectiveCourtFilter,
    startTime: '12:00', endTime: '14:00', description: 'Maintenance window',
  });

  const submitMaintenance = async () => {
    const nextDay = maintenance.endTime <= maintenance.startTime;
    try {
      await ownerCalendarApi.addMaintenance(maintenance.courtId, {
        startDateTime: `${date}T${maintenance.startTime}:00`,
        endDateTime: `${dayjs(date).add(nextDay ? 1 : 0, 'day').format('YYYY-MM-DD')}T${maintenance.endTime}:00`,
        description: maintenance.description,
      });
      toast.success('Maintenance window added');
      setMaintenance(null);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add maintenance');
    }
  };

  const moveWeek = (days) => {
    const next = rangeStart.add(days, 'day');
    setRangeStart(next);
    setDate(next.format('YYYY-MM-DD'));
  };

  return (
    <div className="mx-auto max-w-[1500px] pb-8">
      <OwnerPageHeader
        eyebrow="Venue operations"
        title={calendar?.venueName ? `${calendar.venueName} calendar` : 'Booking calendar'}
        description="Review court availability, add walk-ins and reserve time for operational work."
        actions={<>
          <Button component={Link} to={`/owner/venues/${venueId}/courts`} variant="outlined" startIcon={<Stadium />}>Manage courts</Button>
          <Button variant="contained" color="secondary" startIcon={<Build />} disabled={!courtCalendars.length} onClick={openMaintenance}>Add maintenance</Button>
        </>}
      />

      <section aria-label="Calendar summary" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {calendarQuery.isLoading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} variant="rounded" height={128} />) : <>
          <OwnerMetricCard icon={Stadium} label="Courts shown" value={courtCalendars.length} detail={dayjs(date).format('dddd, D MMMM')} />
          <OwnerMetricCard icon={EventAvailable} label="Available slots" value={availableCount} detail={`${allSlots.length} total bookable intervals`} tone="lime" />
          <OwnerMetricCard icon={LockClock} label="Booked or held" value={bookedCount} detail="Confirmed and pending reservations" tone="blue" />
          <OwnerMetricCard icon={CalendarMonth} label="Occupancy" value={`${occupancy}%`} detail={`${unavailableCount} blocked or under maintenance`} tone="amber" />
        </>}
      </section>

      <section className="surface-card mt-6 overflow-hidden">
        <div className="border-b border-line p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <Button aria-label="Previous week" variant="outlined" className="!min-w-11 !shrink-0 !px-0" onClick={() => moveWeek(-7)}><ArrowBack /></Button>
              <div className="min-w-0 flex-1 overflow-x-auto pb-1">
              <div className="grid min-w-[560px] grid-cols-7 gap-2">
                {dates.map((day) => {
                  const active = day === date;
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDate(day)}
                      className={`min-w-[72px] rounded-xl border px-3 py-2 text-center transition ${active ? 'border-navy-900 bg-navy-900 text-white shadow-sm dark:border-lime-400 dark:bg-lime-400 dark:text-navy-900' : 'border-line bg-surface text-muted hover:border-navy-300 hover:text-ink'}`}
                    >
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider">{dayjs(day).format('ddd')}</span>
                      <span className="mt-0.5 block text-sm font-black">{dayjs(day).format('D MMM')}</span>
                    </button>
                  );
                })}
              </div>
              </div>
              <Button aria-label="Next week" variant="outlined" className="!min-w-11 !shrink-0 !px-0" onClick={() => moveWeek(7)}><ArrowForward /></Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-line pt-4 lg:flex-row lg:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter calendar by court">
              <button type="button" aria-pressed={effectiveCourtFilter === 'all'} onClick={() => setCourtFilter('all')} className={`calendar-filter ${effectiveCourtFilter === 'all' ? 'calendar-filter-active' : ''}`}>All courts</button>
              {courtCalendars.map((court) => <button key={court.courtId} type="button" aria-pressed={effectiveCourtFilter === court.courtId} onClick={() => setCourtFilter(court.courtId)} className={`calendar-filter ${effectiveCourtFilter === court.courtId ? 'calendar-filter-active' : ''}`}>{court.courtName}</button>)}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted" aria-label="Availability legend">
              {Object.entries(STATUS).map(([key, status]) => <span key={key} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${key === 'AVAILABLE' ? 'bg-emerald-500' : key === 'BOOKED' ? 'bg-rose-500' : key === 'HELD' ? 'bg-amber-500' : key === 'MAINTENANCE' ? 'bg-violet-500' : 'bg-slate-400'}`} />{status.label}</span>)}
            </div>
          </div>
        </div>

        {calendarQuery.isLoading ? (
          <div className="space-y-3 p-5">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} variant="rounded" height={62} />)}</div>
        ) : calendarQuery.isError ? (
          <div className="p-6 text-center"><p className="font-extrabold text-ink">Calendar unavailable</p><p className="mt-1 text-sm text-muted">We couldn’t load availability for this date.</p><Button className="!mt-4" onClick={refresh}>Try again</Button></div>
        ) : !visibleCourts.length || !timeRows.length ? (
          <div className="p-5"><EmptyState icon={CalendarMonth} title="No bookable times" description="This venue is closed or has no active courts for the selected date." /></div>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="calendar-board min-w-max"
              style={{ gridTemplateColumns: `104px repeat(${visibleCourts.length}, minmax(164px, 1fr))` }}
            >
              <div className="calendar-corner">Time</div>
              {visibleCourts.map((court) => <div key={court.courtId} className="calendar-court-heading"><strong>{court.courtName}</strong><span>{court.sportName || 'Bookable facility'}</span></div>)}
              {timeRows.flatMap((row) => {
                const key = slotKey(row);
                return [
                  <div key={`time-${key}`} className="calendar-time"><strong>{timeLabel(row.startTime)}</strong><span>{String(row.endTime) <= String(row.startTime) ? 'Next day' : timeLabel(row.endTime)}</span></div>,
                  ...visibleCourts.map((court) => {
                    const slot = (court.slots || []).find((candidate) => slotKey(candidate) === key);
                    if (!slot) return <div key={`${court.courtId}-${key}`} className="calendar-cell"><span className="text-xs text-muted">Not offered</span></div>;
                    const statusKey = slotStatus(slot);
                    const status = STATUS[statusKey] || STATUS.BOOKED;
                    return (
                      <div key={`${court.courtId}-${key}`} className="calendar-cell">
                        <button
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSlotAction({ court, slot })}
                          aria-label={`${court.courtName}, ${slotLabel(slot)}, ${status.label}`}
                          className={`calendar-slot ${status.className} ${slot.available ? '' : 'cursor-default'}`}
                        >
                          <span className="font-extrabold">{status.label}</span>
                          <span className="mt-1 text-[11px] opacity-75">{slot.available ? `LKR ${Number(slot.price || 0).toLocaleString()}` : slotLabel(slot)}</span>
                        </button>
                      </div>
                    );
                  }),
                ];
              })}
            </div>
          </div>
        )}
      </section>

      <Dialog open={Boolean(slotAction)} onClose={() => setSlotAction(null)} fullWidth maxWidth="xs">
        <DialogTitle>Manage available time</DialogTitle>
        <DialogContent className="!pt-1">
          <p className="text-sm text-muted">{slotAction?.court.courtName} · {slotAction && slotLabel(slotAction.slot)} on {dayjs(date).format('D MMMM')}</p>
          <div className="mt-5 grid gap-3">
            <button type="button" onClick={() => openWalkIn(slotAction.court, slotAction.slot)} className="flex items-center gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950/20"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-200 text-navy-900"><Add /></span><span><strong className="block text-ink">Create walk-in booking</strong><small className="text-muted">Reserve this time for a guest</small></span></button>
            <button type="button" onClick={blockSlot} className="flex items-center gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700"><LockClock /></span><span><strong className="block text-ink">Block this time</strong><small className="text-muted">Make the slot unavailable to customers</small></span></button>
          </div>
        </DialogContent>
        <DialogActions><Button onClick={() => setSlotAction(null)}>Cancel</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(walkIn)} onClose={() => setWalkIn(null)} fullWidth maxWidth="xs">
        <DialogTitle>Walk-in booking</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <p className="text-sm text-muted">{walkIn?.courtName} · {dayjs(date).format('D MMMM YYYY')}</p>
          <TextField required label="Guest name" value={walkIn?.guestName || ''} onChange={(event) => setWalkIn({ ...walkIn, guestName: event.target.value })} />
          <TextField required label="Guest phone" value={walkIn?.guestPhone || ''} onChange={(event) => setWalkIn({ ...walkIn, guestPhone: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField type="time" label="Start" value={walkIn?.startTime || ''} slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => setWalkIn({ ...walkIn, startTime: event.target.value })} />
            <TextField type="time" label="End" value={walkIn?.endTime || ''} slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => setWalkIn({ ...walkIn, endTime: event.target.value })} />
          </div>
        </DialogContent>
        <DialogActions><Button onClick={() => setWalkIn(null)}>Cancel</Button><Button variant="contained" disabled={!walkIn?.guestName || !walkIn?.guestPhone} onClick={submitWalkIn}>Confirm cash booking</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(maintenance)} onClose={() => setMaintenance(null)} fullWidth maxWidth="xs">
        <DialogTitle>Add maintenance window</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField select label="Court" value={maintenance?.courtId || ''} onChange={(event) => setMaintenance({ ...maintenance, courtId: event.target.value })}>
            {courtCalendars.map((court) => <MenuItem key={court.courtId} value={court.courtId}>{court.courtName}</MenuItem>)}
          </TextField>
          <div className="grid grid-cols-2 gap-3">
            <TextField type="time" label="Start" value={maintenance?.startTime || ''} slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => setMaintenance({ ...maintenance, startTime: event.target.value })} />
            <TextField type="time" label="End" value={maintenance?.endTime || ''} slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => setMaintenance({ ...maintenance, endTime: event.target.value })} />
          </div>
          <TextField label="Description" value={maintenance?.description || ''} onChange={(event) => setMaintenance({ ...maintenance, description: event.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setMaintenance(null)}>Cancel</Button><Button variant="contained" disabled={!maintenance?.courtId || !maintenance?.startTime || !maintenance?.endTime} onClick={submitMaintenance}>Add maintenance</Button></DialogActions>
      </Dialog>
    </div>
  );
}
