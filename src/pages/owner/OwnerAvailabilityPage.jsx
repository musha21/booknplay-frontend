import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import dayjs from 'dayjs';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import { useOwnerCalendar, useOwnerCourts, useOwnerVenues } from '../../hooks/useOwner';
import { CalendarToday } from '@mui/icons-material';

const STRIP = 7;

export default function OwnerAvailabilityPage() {
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState('');
  const [courtId, setCourtId] = useState('');
  const [rangeStart, setRangeStart] = useState(dayjs().startOf('day'));
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const courtsQuery = useOwnerCourts(venueId || undefined);
  const calendarQuery = useOwnerCalendar(venueId, date);
  const courts = courtsQuery.data || [];

  useEffect(() => {
    if (!venueId && venues[0]) setVenueId(venues[0].id);
  }, [venues, venueId]);

  const days = useMemo(
    () => Array.from({ length: STRIP }, (_, i) => rangeStart.add(i, 'day')),
    [rangeStart],
  );

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
        description="Week strip from the calendar API."
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button type="button" className="btn-outline shrink-0" onClick={() => setRangeStart((d) => d.subtract(STRIP, 'day'))}>←</button>
          {days.map((day) => {
            const key = day.format('YYYY-MM-DD');
            const active = key === date;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDate(key)}
                className={`min-w-[72px] rounded-2xl border px-3 py-2 text-center text-sm font-bold ${
                  active ? 'border-lime-400 bg-lime-400 text-navy-900' : 'border-line bg-surface text-ink'
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wider opacity-70">{day.format('ddd')}</span>
                {day.format('D MMM')}
              </button>
            );
          })}
          <button type="button" className="btn-outline shrink-0" onClick={() => setRangeStart((d) => d.add(STRIP, 'day'))}>→</button>
        </div>
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
