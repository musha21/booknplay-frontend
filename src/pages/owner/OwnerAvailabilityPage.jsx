import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import dayjs from 'dayjs';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerCalendar, useOwnerCourts, useOwnerVenues } from '../../hooks/useOwner';
import { CalendarToday } from '@mui/icons-material';

export default function OwnerAvailabilityPage() {
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const courtsQuery = useOwnerCourts(venueId || undefined);
  const calendarQuery = useOwnerCalendar(venueId, date);
  const courts = courtsQuery.data || [];

  useEffect(() => {
    if (!venueId && venues[0]) setVenueId(venues[0].id);
  }, [venues, venueId]);

  const shiftDate = (delta) => {
    setDate(dayjs(date).add(delta, 'day').format('YYYY-MM-DD'));
  };

  const courtBlocks = useMemo(() => {
    const list = calendarQuery.data?.courts || [];
    if (!courtId || courtId === 'all') return list;
    return list.filter((c) => c.courtId === courtId);
  }, [calendarQuery.data, courtId]);

  if (!venues.length) {
    return (
      <OwnerPage>
        <OwnerPageHeader eyebrow="Operations" title="Availability" />
        <div className="mt-6">
          <OwnerEmptyState
            icon={CalendarToday}
            title="Add a venue first"
            description="Availability is loaded from the venue calendar API."
            action={<RouterLink to="/owner/venues/new" className="btn-primary">Create venue</RouterLink>}
          />
        </div>
      </OwnerPage>
    );
  }

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Operations"
        title="Availability"
        description="Daily open and closed slots from the calendar API."
        actions={venueId ? (
          <RouterLink to={`/owner/venues/${venueId}/calendar`} className="btn-outline">
            Full calendar
          </RouterLink>
        ) : null}
      />
      <OwnerSection className="mt-6 grid gap-3 sm:grid-cols-2 max-w-2xl">
        <TextField select size="small" label="Venue" value={venueId} onChange={(e) => setVenueId(e.target.value)} fullWidth>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Court" value={courtId || 'all'} onChange={(e) => setCourtId(e.target.value === 'all' ? '' : e.target.value)} fullWidth>
          <MenuItem value="all">All courts</MenuItem>
          {courts.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
      </OwnerSection>

      <OwnerSection className="mt-6">
        <div className="flex max-w-2xl items-center gap-2">
          <button type="button" className="btn-outline shrink-0 !min-w-11 !px-0" aria-label="Previous day" onClick={() => shiftDate(-1)}>←</button>
          <TextField
            type="date"
            size="small"
            label="Date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <button type="button" className="btn-outline shrink-0 !min-w-11 !px-0" aria-label="Next day" onClick={() => shiftDate(1)}>→</button>
        </div>
        <p className="mt-2 text-sm font-semibold text-muted">{dayjs(date).format('dddd, D MMM YYYY')}</p>
      </OwnerSection>

      <OwnerSection className="mt-6">
        {calendarQuery.isLoading ? (
          <Skeleton variant="rounded" height={220} className="!rounded-[20px]" />
        ) : courtBlocks.length === 0 ? (
          <OwnerEmptyState icon={CalendarToday} title="No slots for this day" description="Try another date or court." />
        ) : (
          <div className="space-y-4">
            {courtBlocks.map((court) => (
              <article key={court.courtId} className="surface-card p-4">
                <h3 className="font-black text-ink">{court.courtName}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(court.slots || []).map((slot) => {
                    const open = Boolean(slot.available);
                    return (
                      <span
                        key={`${slot.startTime}-${slot.endTime}`}
                        className={`rounded-xl border px-2.5 py-1 text-xs font-bold ${
                          open
                            ? 'border-lime-300 bg-lime-50 text-navy-900 dark:border-lime-800 dark:bg-lime-900/20 dark:text-lime-100'
                            : 'border-line bg-canvas text-muted'
                        }`}
                      >
                        {String(slot.startTime || '').slice(0, 5)}–{String(slot.endTime || '').slice(0, 5)}
                        {!open && slot.reason ? ` · ${slot.reason}` : ''}
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
