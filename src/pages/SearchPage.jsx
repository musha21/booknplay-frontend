import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Map as MapIcon, Star, ViewList } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { usePublicPromotions, useSports, useVenues } from '../hooks/useVenues';
import PlacesAutocompleteInput from '../components/maps/PlacesAutocompleteInput';
import VenueMap from '../components/maps/VenueMap';
import VenueCard from '../components/ui/VenueCard';
import EmptyState from '../components/ui/EmptyState';
import { buildVenueQuery, buildVenueSearchParams } from '../utils/searchParams';
import { formatCurrency } from '../utils/formatters';
import { formatDistanceKm, haversineKm } from '../utils/geo';
import { KANDY_CENTER } from '../lib/googleMaps';
import { MAIN_SPORT_FALLBACKS, curateMainSports } from '../constants/sports';

export default function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState('');
  const [locationDraft, setLocationDraft] = useState(params.get('location') || params.get('city') || '');
  const filters = useMemo(() => ({
    sportId: params.get('sportId') || '',
    city: params.get('city') || '',
    location: params.get('location') || params.get('city') || '',
    date: params.get('date') || '',
    time: params.get('time') || '',
    lat: params.get('lat') || '',
    lng: params.get('lng') || '',
    radiusKm: params.get('radiusKm') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    amenity: params.get('amenity') || '',
    indoorOutdoor: params.get('indoorOutdoor') || '',
    minRating: params.get('minRating') || '',
  }), [params]);

  const queryParams = useMemo(() => buildVenueQuery({ ...filters, size: 60 }), [filters]);
  const venuesQuery = useVenues(queryParams);
  const sportsQuery = useSports();
  const promotionsQuery = usePublicPromotions();
  const promotions = promotionsQuery.data || [];
  const sports = useMemo(() => {
    const source = sportsQuery.data || [];
    const curated = curateMainSports(source);
    const missing = MAIN_SPORT_FALLBACKS.filter(
      (fallback) => !curated.some((sport) => sport.displayName === fallback.displayName),
    );
    return [...curated, ...missing];
  }, [sportsQuery.data]);

  const venues = useMemo(() => {
    const originLat = Number(filters.lat);
    const originLng = Number(filters.lng);
    const hasOrigin = filters.lat !== '' && filters.lng !== '' && Number.isFinite(originLat) && Number.isFinite(originLng);
    return (venuesQuery.data || []).map((venue) => {
      const km = hasOrigin ? haversineKm(originLat, originLng, venue.latitude, venue.longitude) : null;
      return { ...venue, distanceKm: km, distanceLabel: formatDistanceKm(km) };
    });
  }, [venuesQuery.data, filters.lat, filters.lng]);

  const selected = venues.find((venue) => String(venue.id) === String(selectedId));
  const sportLabel = sports.find((sport) => String(sport.id) === String(filters.sportId))?.displayName
    || sports.find((sport) => String(sport.id) === String(filters.sportId))?.name
    || 'All sports';
  const placeLabel = filters.location || filters.city || 'Kandy';
  const courtsNearby = venues.reduce((sum, venue) => sum + (Number(venue.availableCourtCount) || 0), 0);
  const whenLabel = [filters.date, filters.time].filter(Boolean).join(' ') || 'Any time';
  const mapCenter = filters.lat && filters.lng
    ? { lat: Number(filters.lat), lng: Number(filters.lng) }
    : KANDY_CENTER;
  const userLocation = filters.lat && filters.lng
    ? { lat: Number(filters.lat), lng: Number(filters.lng) }
    : null;

  const apply = (next) => {
    navigate({ pathname: '/search', search: `?${buildVenueSearchParams({ ...filters, ...next }).toString()}` });
  };

  const amenities = useMemo(() => {
    const set = new Set();
    venues.forEach((venue) => (venue.amenities || []).forEach((item) => set.add(item)));
    return [...set].slice(0, 12);
  }, [venues]);

  return (
    <main className="page-shell search-page py-6 sm:py-10">
      <div className="section-container">
        <p className="eyebrow">Find a court</p>
        <h1 className="section-title mt-2">Courts near {placeLabel}</h1>
        <p className="customer-body mt-2">
          {placeLabel}, {sportLabel}, {whenLabel}
          {courtsNearby ? `, ${courtsNearby} courts nearby` : ''}
        </p>

        <form
          className="search-filters mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            apply({
              date: data.get('date'),
              time: data.get('time'),
              minPrice: data.get('minPrice'),
              maxPrice: data.get('maxPrice'),
              amenity: data.get('amenity'),
              indoorOutdoor: data.get('indoorOutdoor'),
              minRating: data.get('minRating'),
              sportId: data.get('sportId'),
            });
          }}
        >
          <label>
            Location
            <PlacesAutocompleteInput
              value={locationDraft}
              onChange={setLocationDraft}
              onPlace={(place) => apply({
                location: place.city || place.formattedAddress,
                city: place.city || '',
                lat: place.latitude,
                lng: place.longitude,
                radiusKm: 25,
              })}
            />
          </label>
          <label>
            Sport
            <select name="sportId" defaultValue={filters.sportId} key={filters.sportId}>
              <option value="">All sports</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.displayName || sport.name}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" name="date" defaultValue={filters.date} key={filters.date} />
          </label>
          <label>
            Time
            <input type="time" name="time" step="1800" defaultValue={filters.time} key={filters.time} />
          </label>
          <label>
            Min price
            <input type="number" name="minPrice" min="0" defaultValue={filters.minPrice} />
          </label>
          <label>
            Max price
            <input type="number" name="maxPrice" min="0" defaultValue={filters.maxPrice} />
          </label>
          <label>
            Indoor / outdoor
            <select name="indoorOutdoor" defaultValue={filters.indoorOutdoor} key={filters.indoorOutdoor}>
              <option value="">Any</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </label>
          <label>
            Min rating
            <select name="minRating" defaultValue={filters.minRating} key={filters.minRating}>
              <option value="">Any</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </label>
          <label>
            Amenity
            <select name="amenity" defaultValue={filters.amenity} key={filters.amenity}>
              <option value="">Any</option>
              {amenities.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button type="submit" className="hp-search-button">Apply filters</button>
        </form>

        <div className="search-view-toggle mt-4">
          <button type="button" className={view !== 'map' ? 'is-active' : ''} onClick={() => setView('list')}>
            <ViewList fontSize="small" /> List
          </button>
          <button type="button" className={view !== 'list' ? 'is-active' : ''} onClick={() => setView('map')}>
            <MapIcon fontSize="small" /> Map
          </button>
        </div>

        <div className={`search-layout search-layout--${view}`}>
          <div className="search-list">
            {venuesQuery.isPending && (
              <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={160} />)}</div>
            )}
            {!venuesQuery.isPending && venues.length === 0 && (
              <EmptyState title="No courts match" description="Try another area, sport, or time." actionLabel="Clear filters" onAction={() => navigate('/search')} />
            )}
            {venues.map((venue) => {
              const deal = promotions.find((promo) => !promo.venueIds?.length || promo.venueIds.includes(venue.id));
              return (
              <article
                key={venue.id}
                className={`search-result-card ${String(venue.id) === String(selectedId) ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(venue.id)}
              >
                <VenueCard venue={venue} variant="home" />
                <p className="search-result-meta">
                  {venue.rating ? <><Star fontSize="inherit" /> {Number(venue.rating).toFixed(1)} ({venue.reviewCount || 0})</> : 'New'}
                  {venue.distanceLabel ? ` · ${venue.distanceLabel}` : ''}
                  {venue.startingPrice != null ? ` · from ${formatCurrency(venue.startingPrice)}` : ''}
                  {venue.availableCourtCount != null ? ` · ${venue.availableCourtCount} courts available` : ''}
                  {deal ? ` · Deal: ${deal.name}` : ''}
                  {' · '}
                  <Link to={`/venues/${venue.id}${userLocation ? `?fromLat=${userLocation.lat}&fromLng=${userLocation.lng}` : ''}`}>Open venue</Link>
                </p>
              </article>
              );
            })}
          </div>
          <div className="search-map">
            <VenueMap
              className="search-map-canvas"
              venues={venues}
              center={mapCenter}
              userLocation={userLocation}
              selectedId={selectedId}
              onSelect={(venue) => setSelectedId(venue.id)}
            />
            {selected && (
              <div className="search-map-card">
                <strong>{selected.name}</strong>
                <p>{selected.sportName} · from {formatCurrency(selected.startingPrice)} · {selected.availableCourtCount ?? 0} courts</p>
                <Link to={`/venues/${selected.id}`}>View venue</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
