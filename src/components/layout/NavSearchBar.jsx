import React, { useMemo, useState } from 'react';
import { LocationOn, MyLocation, Search } from '@mui/icons-material';
import { useSports } from '../../hooks/useVenues';
import { MAIN_SPORT_FALLBACKS, curateMainSports } from '../../constants/sports';
import PlacesAutocompleteInput from '../maps/PlacesAutocompleteInput';
import { geocodeAddress, reverseGeocode } from '../../lib/googleMaps';

export default function NavSearchBar({ initialFilters = {}, onSubmit }) {
  const sportsQuery = useSports();
  const sports = useMemo(() => sportsQuery.data || [], [sportsQuery.data]);
  const [sportId, setSportId] = useState(initialFilters.sportId || '');
  const [city, setCity] = useState(initialFilters.city || initialFilters.location || '');
  const [locationLabel, setLocationLabel] = useState(initialFilters.location || initialFilters.city || '');
  const [lat, setLat] = useState(initialFilters.lat || '');
  const [lng, setLng] = useState(initialFilters.lng || '');
  const [date, setDate] = useState(initialFilters.date || '');
  const [time, setTime] = useState(initialFilters.time || '');
  const [nearMeBusy, setNearMeBusy] = useState(false);
  const today = new Date().toLocaleDateString('en-CA');
  const heroSports = useMemo(() => {
    const curated = curateMainSports(sports);
    const missing = MAIN_SPORT_FALLBACKS.filter(
      (fallback) => !curated.some((sport) => sport.displayName === fallback.displayName),
    );
    return [...curated, ...missing].slice(0, 10);
  }, [sports]);

  const payload = () => ({
    sportId,
    city,
    location: locationLabel || city,
    date,
    time,
    lat,
    lng,
    radiusKm: lat && lng ? 25 : '',
  });

  const submit = (event) => {
    event.preventDefault();
    onSubmit?.(payload());
  };

  const useNearMe = () => {
    if (!navigator.geolocation) return;
    setNearMeBusy(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const nextLat = pos.coords.latitude;
      const nextLng = pos.coords.longitude;
      setLat(nextLat);
      setLng(nextLng);
      try {
        const place = await reverseGeocode(nextLat, nextLng);
        const label = place?.city || place?.formattedAddress || 'Near me';
        setLocationLabel(label);
        setCity(place?.city || '');
      } catch {
        setLocationLabel('Near me');
      } finally {
        setNearMeBusy(false);
      }
    }, () => setNearMeBusy(false));
  };

  return (
    <div className='hp-search-stack'>
      <form onSubmit={submit} className='hp-search-bar' role='search' aria-label='Find a court'>
        <label className='hp-search-field'>
          <span>Where do you want to play</span>
          <PlacesAutocompleteInput
            value={locationLabel}
            onChange={(value) => {
              setLocationLabel(value);
              setCity(value);
              setLat('');
              setLng('');
            }}
            onPlace={async (place) => {
              setLocationLabel(place.city || place.formattedAddress);
              setCity(place.city || '');
              setLat(place.latitude);
              setLng(place.longitude);
              if (place.latitude == null) {
                const geo = await geocodeAddress(place.formattedAddress);
                if (geo) {
                  setLat(geo.latitude);
                  setLng(geo.longitude);
                  setCity(geo.city || place.city || '');
                }
              }
            }}
            placeholder='Kandy, Peradeniya…'
            aria-label='Location'
          />
        </label>
        <label className='hp-search-field'>
          <span>Sport</span>
          <select value={sportId} onChange={(event) => setSportId(event.target.value)} aria-label='Sport'>
            <option value=''>All sports</option>
            {heroSports.map((sport) => <option key={sport.id} value={sport.id}>{sport.displayName || sport.name}</option>)}
          </select>
        </label>
        <label className='hp-search-field'>
          <span>Date</span>
          <input type='date' min={today} value={date} onChange={(event) => setDate(event.target.value)} aria-label='Booking date' />
        </label>
        <label className='hp-search-field'>
          <span>Time</span>
          <input type='time' step='1800' value={time} onChange={(event) => setTime(event.target.value)} aria-label='Booking time' />
        </label>
        <button type='submit' className='hp-search-button'>
          <Search /> Find a court
        </button>
      </form>
      <div className='hp-search-caption'>
        <span className='hp-location-status'><LocationOn fontSize='small' /> Search courts across Sri Lanka — starting in Kandy</span>
        <button type='button' onClick={useNearMe} disabled={nearMeBusy}>
          <MyLocation fontSize='small' /> {nearMeBusy ? 'Finding you…' : 'Near me'}
        </button>
      </div>
    </div>
  );
}
