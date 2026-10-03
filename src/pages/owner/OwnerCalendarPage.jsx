import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Skeleton, TextField,
} from '@mui/material';
import {
  Add, ArrowBack, ArrowForward, Build, CalendarMonth, LockClock, Stadium,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useOwnerCalendar, useOwnerCourts, useOwnerSubscription } from '../../hooks/useOwner';
import ownerCalendarApi from '../../api/ownerCalendar';
import EmptyState from '../../components/ui/EmptyState';
import {
  canUseWalkIns,
  isOwnerSubscriptionsEnabled,
  planLimitMessage,
} from '../../utils/subscription';

const STATUS = {
  AVAILABLE: {
    label: 'Open',
    className: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
    dot: 'bg-emerald-500',
  },
  BOOKED: {
    label: 'Booked',
    className: 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100',
    dot: 'bg-rose-500',
  },
  HELD: {
    label: 'Held',
    className: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
    dot: 'bg-amber-500',
  },
  BLOCKED: {
    label: 'Blocked',
    className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
    dot: 'bg-slate-400',
  },
  MAINTENANCE: {
    label: 'Maint.',
    className: 'border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100',
    dot: 'bg-violet-500',
  },
};

const slotStatus = (slot) => (slot.available ? 'AVAILABLE' : (slot.reason || 'BOOKED'));
const timeLabel = (value) => String(value || '').slice(0, 5);
const slotKey = (slot) => `${slot.startTime}-${slot.endTime}`;
const slotLabel = (slot) => `${timeLabel(slot.startTime)}–${timeLabel(slot.endTime)}${String(slot.endTime) <= String(slot.startTime) ? ' +1' : ''}`;

export default function OwnerCalendarPage() {
  const { venueId } = useParams();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [rangeStart, setRangeStart] = useState(dayjs().startOf('day'));
  const [courtFilter, setCourtFilter] = useState('all');
  const [panel, setPanel] = useState(null);
  const [walkInForm, setWalkInForm] = useState({ guestName: '', guestPhone: '' });
  const [adjustTime, setAdjustTime] = useState(false);
  const [maintenance, setMaintenance] = useState(null);
  const courtsQuery = useOwnerCourts(venueId);
  const calendarQuery = useOwnerCalendar(venueId, date);
  const { data: subscription } = useOwnerSubscription();
  const courts = courtsQuery.data || [];
  const walkInsAllowed = !isOwnerSubscriptionsEnabled() || canUseWalkIns(subscription);
  const calendar = calendarQuery.data;

  const courtCalendars = calendar?.courts || courts.map((court) => ({
    courtId: court.id,
    courtName: court.name,
    sportName: court.sportName,
    slots: [],
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(max-width: 1023px)').matches && courtCalendars[0]?.courtId && courtFilter === 'all') {
      setCourtFilter(courtCalendars[0].courtId);
    }
  }, [courtCalendars, courtFilter]);

  const effectiveCourtFilter = courtCalendars.some((court) => court.courtId === courtFilter) ? courtFilter : 'all';
  const visibleCourts = effectiveCourtFilter === 'all'
    ? courtCalendars
    : courtCalendars.filter((court) => court.courtId === effectiveCourtFilter);

  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => rangeStart.add(index, 'day').format('YYYY-MM-DD')),
    [rangeStart],
  );
  const timeRows = useMemo(() => {
    const seen = new Set();
    const rows = [];
    visibleCourts.forEach((court) => (court.slots || []).forEach((slot) => {
      const key = slotKey(slot);
      if (!seen.has(key)) {
        seen.add(key);
        rows.push(slot);
      }
    }));
    return rows;
  }, [visibleCourts]);

  const allSlots = courtCalendars.flatMap((court) => court.slots || []);
  const availableCount = allSlots.filter((slot) => slot.available).length;

  const refresh = () => calendarQuery.refetch();

  const openSlot = (court, slot) => {
    setAdjustTime(false);
    setWalkInForm({ guestName: '', guestPhone: '' });
    setPanel({
      mode: slot.available ? 'actions' : 'details',
      court,
      slot,
      startTime: timeLabel(slot.startTime),
      endTime: timeLabel(slot.endTime),
    });
  };

  const submitWalkIn = async () => {
    if (!panel) return;
    try {
      await ownerCalendarApi.createWalkIn({
        courtId: panel.court.courtId,
        date,
        startTime: `${panel.startTime}:00`,
        endTime: `${panel.endTime}:00`,
        guestName: walkInForm.guestName.trim(),
        guestPhone: walkInForm.guestPhone.trim(),
      });
      toast.success('Walk-in booking created');
      setPanel(null);
      refresh();
    } catch (error) {
      toast.error(planLimitMessage(error, 'Walk-in booking failed'));
    }
  };

  const blockSlot = async () => {
    if (!panel) return;
    try {
      await ownerCalendarApi.addBlockedSlot(panel.court.courtId, {
        date,
        startTime: panel.slot.startTime,
        endTime: panel.slot.endTime,
        reason: 'Owner block',
      });
      toast.success('Time blocked');
      setPanel(null);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not block this time');
    }
  };

  const openMaintenance = () => setMaintenance({
    courtId: effectiveCourtFilter === 'all' ? courtCalendars[0]?.courtId || '' : effectiveCourtFilter,
    startTime: '12:00',
    endTime: '14:00',
    description: 'Maintenance window',
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

  const statusKey = panel ? slotStatus(panel.slot) : null;
  const status = statusKey ? (STATUS[statusKey] || STATUS.BOOKED) : null;

  return (
    <div className="owner-calendar-shell">
      <header className="owner-calendar-toolbar">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">Today’s board</p>
          <h1 className="truncate text-lg font-black text-ink sm:text-xl">
            {calendar?.venueName || 'Booking calendar'}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {dayjs(date).format('dddd, D MMM')} · {availableCount} open slots
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button component={Link} to={`/owner/venues/${venueId}/courts`} size="small" variant="outlined" startIcon={<Stadium />}>
            Spaces
          </Button>
          <Button size="small" variant="contained" color="secondary" startIcon={<Build />} disabled={!courtCalendars.length} onClick={openMaintenance}>
            Maintenance
          </Button>
        </div>
      </header>

      <div className="owner-calendar-controls">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button aria-label="Previous week" variant="outlined" size="small" className="!min-w-10 !shrink-0 !px-0" onClick={() => moveWeek(-7)}>
            <ArrowBack fontSize="small" />
          </Button>
          <div className="owner-calendar-days" role="tablist" aria-label="Week days">
            {dates.map((day) => {
              const active = day === date;
              return (
                <button
                  key={day}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDate(day)}
                  className={`owner-day-chip ${active ? 'owner-day-chip-active' : ''}`}
                >
                  <span>{dayjs(day).format('ddd')}</span>
                  <strong>{dayjs(day).format('D')}</strong>
                </button>
              );
            })}
          </div>
          <Button aria-label="Next week" variant="outlined" size="small" className="!min-w-10 !shrink-0 !px-0" onClick={() => moveWeek(7)}>
            <ArrowForward fontSize="small" />
          </Button>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Filter by bookable space">
            <button type="button" aria-pressed={effectiveCourtFilter === 'all'} onClick={() => setCourtFilter('all')} className={`calendar-filter ${effectiveCourtFilter === 'all' ? 'calendar-filter-active' : ''}`}>
              All
            </button>
            {courtCalendars.map((court) => (
              <button
                key={court.courtId}
                type="button"
                aria-pressed={effectiveCourtFilter === court.courtId}
                onClick={() => setCourtFilter(court.courtId)}
                className={`calendar-filter ${effectiveCourtFilter === court.courtId ? 'calendar-filter-active' : ''}`}
              >
                {court.courtName}
              </button>
            ))}
          </div>
          <div className="hidden flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-muted lg:flex" aria-label="Legend">
            {Object.entries(STATUS).map(([key, item]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="owner-calendar-board-wrap surface-card">
        {calendarQuery.isLoading ? (
          <div className="space-y-3 p-4">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} variant="rounded" height={48} />)}</div>
        ) : calendarQuery.isError ? (
          <div className="p-6 text-center">
            <p className="font-extrabold text-ink">Calendar unavailable</p>
            <Button className="!mt-4" onClick={refresh}>Try again</Button>
          </div>
        ) : !visibleCourts.length || !timeRows.length ? (
          <div className="p-5">
            <EmptyState
              icon={CalendarMonth}
              title="No bookable times"
              description="Add bookable spaces and pricing, or pick another day."
            />
          </div>
        ) : (
          <div className="owner-calendar-board-scroll">
            <div
              className="calendar-board owner-calendar-board"
              style={{ gridTemplateColumns: `72px repeat(${visibleCourts.length}, minmax(120px, 1fr))` }}
            >
              <div className="calendar-corner">Time</div>
              {visibleCourts.map((court) => (
                <div key={court.courtId} className="calendar-court-heading">
                  <strong>{court.courtName}</strong>
                  <span>{court.sportName || 'Space'}</span>
                </div>
              ))}
              {timeRows.flatMap((row) => {
                const key = slotKey(row);
                return [
                  <div key={`time-${key}`} className="calendar-time">
                    <strong>{timeLabel(row.startTime)}</strong>
                    <span>{timeLabel(row.endTime)}</span>
                  </div>,
                  ...visibleCourts.map((court) => {
                    const slot = (court.slots || []).find((candidate) => slotKey(candidate) === key);
                    if (!slot) {
                      return (
                        <div key={`${court.courtId}-${key}`} className="calendar-cell">
                          <span className="text-[10px] text-muted">—</span>
                        </div>
                      );
                    }
                    const keyStatus = slotStatus(slot);
                    const item = STATUS[keyStatus] || STATUS.BOOKED;
                    return (
                      <div key={`${court.courtId}-${key}`} className="calendar-cell">
                        <button
                          type="button"
                          onClick={() => openSlot(court, slot)}
                          aria-label={`${court.courtName}, ${slotLabel(slot)}, ${item.label}`}
                          className={`calendar-slot ${item.className}`}
                        >
                          <span className="font-extrabold">{item.label}</span>
                          <span className="mt-0.5 text-[10px] opacity-80">
                            {slot.available
                              ? `LKR ${Number(slot.price || 0).toLocaleString()}`
                              : slotLabel(slot)}
                          </span>
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

      <Dialog open={Boolean(panel)} onClose={() => setPanel(null)} fullWidth maxWidth="xs">
        <DialogTitle>
          {panel?.mode === 'details' ? 'Slot details' : panel?.mode === 'walkin' ? 'Walk-in guest' : 'Manage slot'}
        </DialogTitle>
        <DialogContent className="!pt-1">
          {panel && (
            <>
              <p className="text-sm text-muted">
                {panel.court.courtName} · {slotLabel(panel.slot)} · {dayjs(date).format('D MMM')}
              </p>
              {panel.mode === 'details' && status && (
                <div className={`mt-4 rounded-2xl border p-4 ${status.className}`}>
                  <p className="text-sm font-extrabold">{status.label}</p>
                  <p className="mt-1 text-xs opacity-80">This time is not open for a new walk-in.</p>
                </div>
              )}
              {panel.mode === 'actions' && (
                <div className="mt-4 grid gap-3">
                  {walkInsAllowed ? (
                    <button
                      type="button"
                      onClick={() => setPanel({ ...panel, mode: 'walkin' })}
                      className="flex items-center gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950/20"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-200 text-navy-900"><Add /></span>
                      <span>
                        <strong className="block text-ink">Walk-in</strong>
                        <small className="text-muted">Name and phone only</small>
                      </span>
                    </button>
                  ) : (
                    <Link to="/owner/billing" className="flex items-center gap-3 rounded-2xl border border-line p-4 text-left">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700"><Add /></span>
                      <span>
                        <strong className="block text-ink">Upgrade for walk-ins</strong>
                        <small className="text-muted">Open billing</small>
                      </span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={blockSlot}
                    className="flex items-center gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-slate-400"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700"><LockClock /></span>
                    <span>
                      <strong className="block text-ink">Block this time</strong>
                      <small className="text-muted">Hide from customers</small>
                    </span>
                  </button>
                </div>
              )}
              {panel.mode === 'walkin' && (
                <div className="mt-4 flex flex-col gap-3">
                  <TextField
                    required
                    autoFocus
                    label="Guest name"
                    value={walkInForm.guestName}
                    onChange={(event) => setWalkInForm({ ...walkInForm, guestName: event.target.value })}
                  />
                  <TextField
                    required
                    label="Guest phone"
                    value={walkInForm.guestPhone}
                    onChange={(event) => setWalkInForm({ ...walkInForm, guestPhone: event.target.value })}
                  />
                  <p className="text-xs text-muted">
                    Slot locked to {panel.startTime}–{panel.endTime}.
                    {' '}
                    <button type="button" className="font-bold text-ink underline" onClick={() => setAdjustTime((v) => !v)}>
                      {adjustTime ? 'Hide time' : 'Adjust time'}
                    </button>
                  </p>
                  {adjustTime && (
                    <div className="grid grid-cols-2 gap-3">
                      <TextField
                        type="time"
                        label="Start"
                        value={panel.startTime}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(event) => setPanel({ ...panel, startTime: event.target.value })}
                      />
                      <TextField
                        type="time"
                        label="End"
                        value={panel.endTime}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(event) => setPanel({ ...panel, endTime: event.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {panel?.mode === 'walkin' ? (
            <>
              <Button onClick={() => setPanel({ ...panel, mode: 'actions' })}>Back</Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={!walkInForm.guestName.trim() || !walkInForm.guestPhone.trim()}
                onClick={submitWalkIn}
              >
                Confirm walk-in
              </Button>
            </>
          ) : (
            <Button onClick={() => setPanel(null)}>Close</Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(maintenance)} onClose={() => setMaintenance(null)} fullWidth maxWidth="xs">
        <DialogTitle>Add maintenance window</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField select label="Bookable space" value={maintenance?.courtId || ''} onChange={(event) => setMaintenance({ ...maintenance, courtId: event.target.value })}>
            {courtCalendars.map((court) => <MenuItem key={court.courtId} value={court.courtId}>{court.courtName}</MenuItem>)}
          </TextField>
          <div className="grid grid-cols-2 gap-3">
            <TextField type="time" label="Start" value={maintenance?.startTime || ''} slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => setMaintenance({ ...maintenance, startTime: event.target.value })} />
            <TextField type="time" label="End" value={maintenance?.endTime || ''} slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => setMaintenance({ ...maintenance, endTime: event.target.value })} />
          </div>
          <TextField label="Description" value={maintenance?.description || ''} onChange={(event) => setMaintenance({ ...maintenance, description: event.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenance(null)}>Cancel</Button>
          <Button variant="contained" disabled={!maintenance?.courtId || !maintenance?.startTime || !maintenance?.endTime} onClick={submitMaintenance}>
            Add maintenance
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
