import { useMemo, useState } from 'react';
import { LocationOn, Search } from '@mui/icons-material';
import { useSports } from '../../hooks/useVenues';
import { KANDY_AREAS } from '../../constants/locations';

export default function NavSearchBar({ initialFilters = {}, onSubmit }) {
  const sportsQuery = useSports();
  const sports = useMemo(() => sportsQuery.data || [], [sportsQuery.data]);
  const [sportId, setSportId] = useState(initialFilters.sportId || '');
  const [city, setCity] = useState(initialFilters.city || initialFilters.location || '');
  const [date, setDate] = useState(initialFilters.date || '');
  const [time, setTime] = useState(initialFilters.time || '');
  const today = new Date().toLocaleDateString('en-CA');
  const heroSports = useMemo(() => [
    ['Badminton', ['badminton']],
    ['Indoor cricket', ['indoor cricket', 'cricket']],
    ['Futsal', ['futsal', 'football']],
  ].map(([label, terms]) => {
    const sport = sports.find((item) => terms.some((term) => String(item.name).toLowerCase().includes(term)));
    return sport ? { ...sport, displayName: label } : null;
  }).filter(Boolean), [sports]);

  const submit = (event) => {
    event.preventDefault();
    onSubmit?.({ sportId, city, date, time });
  };

  return (
    <div className='hp-search-stack'>
      <form onSubmit={submit} className='hp-search-bar' role='search' aria-label='Find a venue'>
        <label className='hp-search-field'>
          <span>Your sport</span>
          <select value={sportId} onChange={(event) => setSportId(event.target.value)} aria-label='Sport'>
            <option value=''>All sports</option>
            {heroSports.map((sport) => <option key={sport.id} value={sport.id}>{sport.displayName || sport.name}</option>)}
          </select>
        </label>
        <label className='hp-search-field'>
          <span>Where</span>
          <select value={city} onChange={(event) => setCity(event.target.value)} aria-label='Location'>
            {KANDY_AREAS.map((area) => (
              <option key={area.id} value={area.value}>
                {area.name}
              </option>
            ))}
          </select>
        </label>
        <label className='hp-search-field'>
          <span>When</span>
          <input type='date' min={today} value={date} onChange={(event) => setDate(event.target.value)} aria-label='Booking date' />
        </label>
        <label className='hp-search-field'>
          <span>Time</span>
          <input type='time' step='1800' value={time} onChange={(event) => setTime(event.target.value)} aria-label='Booking time' />
        </label>
        <button type='submit' className='hp-search-button'>
          <Search /> Find a venue
        </button>
      </form>
      <div className='hp-search-caption'>
        <span className='hp-location-status'><LocationOn fontSize='small' /> Currently available across Kandy & surrounding towns</span>
      </div>
    </div>
  );
}

