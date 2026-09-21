import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from '@mui/icons-material';
import { useSports } from '../../hooks/useVenues';
import { buildVenueSearchParams } from '../../utils/searchParams';

export default function NavSearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sports = useSports().data || [];
  const [city, setCity] = useState(params.get('city') || '');
  const [sportId, setSportId] = useState(params.get('sportId') || '');
  const [name, setName] = useState(params.get('name') || '');
  const [date, setDate] = useState(params.get('date') || '');
  const [time, setTime] = useState(params.get('time') || '');
  const today = new Date().toLocaleDateString('en-CA');

  const submit = (event) => {
    event.preventDefault();
    navigate(`/search?${buildVenueSearchParams({ city, sportId, name, date, time })}`);
  };

  return (
    <form onSubmit={submit} className="nav-search" role="search" aria-label="Find a venue">
      <label className="nav-search-field">
        <span className="nav-search-label">Where</span>
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="City or area"
          autoComplete="address-level2"
        />
      </label>
      <span className="nav-search-split" aria-hidden="true" />
      <label className="nav-search-field nav-search-field-compact">
        <span className="nav-search-label">Date</span>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Booking date"
        />
      </label>
      <span className="nav-search-split" aria-hidden="true" />
      <label className="nav-search-field nav-search-field-compact">
        <span className="nav-search-label">Time</span>
        <input
          type="time"
          step="1800"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          aria-label="Booking time"
        />
      </label>
      <span className="nav-search-split" aria-hidden="true" />
      <label className="nav-search-field">
        <span className="nav-search-label">Sport</span>
        <select value={sportId} onChange={(event) => setSportId(event.target.value)} aria-label="Sport">
          <option value="">Choose sport</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>{sport.name}</option>
          ))}
        </select>
      </label>
      <span className="nav-search-split" aria-hidden="true" />
      <label className="nav-search-field">
        <span className="nav-search-label">Venue</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Search by name"
          autoComplete="off"
        />
      </label>
      <button type="submit" className="nav-search-submit" aria-label="Search venues">
        <Search />
      </button>
    </form>
  );
}
