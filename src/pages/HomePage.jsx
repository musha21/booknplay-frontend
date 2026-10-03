import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bolt, CalendarMonth, Verified } from '@mui/icons-material';
import { useBusinesses, useHomepageConfig, useSports, useVenues } from '../hooks/useVenues';
import BookingHeroFallback from '../components/home/BookingHeroFallback';
import CityDestinationCard from '../components/home/CityDestinationCard';
import VenueShowcase from '../components/home/VenueShowcase';
import PremiumBusinessHero from '../components/home/PremiumBusinessHero';
import { SportCategoryGrid } from '../components/home/SportCategoryButton';
import { buildVenueQuery, buildVenueSearchParams, LAUNCH_CITY } from '../utils/searchParams';
import { venueCover, venueSportLabel } from '../utils/venue';

const HOME_VENUE_SIZE = 24;
const ALL_SPORTS = { id: '', name: 'All sports', displayName: 'All sports', all: true, fallback: true };
const FALLBACK_SPORTS = ['Badminton', 'Indoor cricket', 'Futsal'].map((name) => ({ id: name.toLowerCase(), name, fallback: true }));
const SPORT_PRIORITY = [
  { label: 'Badminton', matches: ['badminton'] },
  { label: 'Indoor cricket', matches: ['indoor cricket', 'cricket'] },
  { label: 'Futsal', matches: ['futsal', 'football'] },
];
const FEATURED_CITIES = ['Kandy', 'Colombo', 'Negombo', 'Dehiwala', 'Kurunegala'];
const DEFAULT_ORDER = ['sports', 'venues', 'cities', 'howItWorks', 'trust', 'ownerPromotion'];

const orderedSelection = (items, ids = []) => ids?.length ? ids.map((id) => items.find((item) => String(item.id) === String(id))).filter(Boolean) : items;
const prioritizedSelection = (items, ids = []) => {
  if (!ids?.length) return items;
  const featured = orderedSelection(items, ids);
  const featuredIds = new Set(featured.map((item) => String(item.id)));
  return [...featured, ...items.filter((item) => !featuredIds.has(String(item.id)))];
};

const venueMatchesSport = (venue, sport) =>
  !sport ||
  sport.all ||
  [venue.sportId, venue.sport?.id].some((id) => String(id) === String(sport.id)) ||
  String(venueSportLabel(venue)).toLowerCase().includes(sport.name.toLowerCase()) ||
  venue.courts?.some((court) => String(court.sportName || court.sport?.name || '').toLowerCase().includes(sport.name.toLowerCase()));

const venueMatchesLocation = (venue, targetLocation) => {
  if (!targetLocation || targetLocation === LAUNCH_CITY) return true;
  const query = targetLocation.toLowerCase();
  const city = String(venue.city || '').toLowerCase();
  const address = String(venue.address || venue.formattedAddress || '').toLowerCase();
  return city.includes(query) || address.includes(query);
};

const curateSports = (items) => SPORT_PRIORITY.map(({ label, matches }) => {
  const preferredNames = [label, `${label} Court`, `${label} Field`, `${label} Pool`].map((name) => name.toLowerCase());
  const exact = items.find((sport) => preferredNames.includes(String(sport.name).toLowerCase()));
  const match = exact || items.find((sport) => matches.some((term) => String(sport.name).toLowerCase().includes(term)));
  return match ? { ...match, displayName: label } : null;
}).filter(Boolean);

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [urlParams] = useSearchParams();
  const sportId = urlParams.get('sportId') || '';
  const city = urlParams.get('city') || '';
  const date = urlParams.get('date') || '';
  const time = urlParams.get('time') || '';
  const [businessId, setBusinessId] = useState('');
  const sportsQuery = useSports();
  useBusinesses();
  const venueParams = useMemo(() => buildVenueQuery({ city, date, time, size: HOME_VENUE_SIZE }), [city, date, time]);
  const venuesQuery = useVenues(venueParams);
  const homepageQuery = useHomepageConfig();
  const homepage = homepageQuery.data || {};

  useEffect(() => {
    if (location.hash !== '#venues') return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key]);

  const sports = useMemo(() => sportsQuery.data || [], [sportsQuery.data]);
  const venues = useMemo(() => venuesQuery.data || [], [venuesQuery.data]);

  const displaySports = useMemo(() => {
    const source = sports.length ? sports : FALLBACK_SPORTS;
    const featured = orderedSelection(source, homepage.featuredSportIds);
    const curated = curateSports(featured);
    const selected = curated.length === SPORT_PRIORITY.length ? curated : curateSports(source);
    const missing = FALLBACK_SPORTS.filter((fallback) => !selected.some((sport) => sport.displayName === fallback.name));
    return [ALL_SPORTS, ...selected, ...missing].slice(0, 4);
  }, [sports, homepage.featuredSportIds]);

  const selectedSport = displaySports.find((sport) => String(sport.id) === String(sportId));

  const cityCards = useMemo(() => {
    const grouped = new Map();
    venues.forEach((venue) => {
      const name = venue.city;
      if (!name) return;
      const current = grouped.get(name) || { city: name, count: 0, cover: '' };
      current.count += 1;
      if (!current.cover) current.cover = venueCover(venue);
      grouped.set(name, current);
    });
    const featured = FEATURED_CITIES.map((name) => grouped.get(name) || { city: name, count: 0, cover: '' });
    const additional = [...grouped.values()].filter((place) => !FEATURED_CITIES.includes(place.city));
    return [...featured, ...additional].slice(0, 5);
  }, [venues]);

  const premiumSlides = homepage.premiumSliderEnabled === false ? [] : (homepage.premiumSlides || []);
  const heroCover = venues.map(venueCover).find(Boolean) || '';

  const matchingVenues = useMemo(() => {
    return venues
      .filter((venue) => venueMatchesSport(venue, selectedSport))
      .filter((venue) => venueMatchesLocation(venue, city))
      .filter((venue) => !businessId || String(venue.businessId) === String(businessId));
  }, [venues, selectedSport, city, businessId]);

  const displayedVenues = useMemo(
    () => sportId || city || date || time || businessId ? matchingVenues : prioritizedSelection(matchingVenues, homepage.featuredVenueIds),
    [matchingVenues, sportId, city, date, time, businessId, homepage.featuredVenueIds],
  );

  const venueCounts = useMemo(
    () => Object.fromEntries(displaySports.map((sport) => [sport.id, venues.filter((venue) => venueMatchesSport(venue, sport)).length])),
    [displaySports, venues],
  );

  const orderOf = (section) => DEFAULT_ORDER.indexOf(section) + 1;
  const scrollToVenues = () => setTimeout(() => document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

  const updateVenueUrl = (filters) => {
    const params = buildVenueSearchParams({ city, ...filters });
    navigate({ pathname: '/', search: `?${params.toString()}`, hash: '#venues' });
  };

  const applySearch = (filters) => {
    setBusinessId('');
    const params = buildVenueSearchParams(filters);
    navigate({ pathname: '/', search: `?${params.toString()}`, hash: '#venues' });
    scrollToVenues();
  };

  const clearFilters = () => applySearch({ sportId: '', city: '', date: '', time: '' });

  const showBusinessVenues = (business) => {
    setBusinessId(business.businessId || business.id);
    updateVenueUrl({ sportId, city, date, time });
    scrollToVenues();
  };

  const findVenue = () => {
    const search = document.getElementById('home-search');
    if (search) search.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else scrollToVenues();
  };

  const searchFilters = useMemo(() => ({ sportId, city, date, time }), [sportId, city, date, time]);

  return (
    <div className="home-page">
      {premiumSlides.length > 0
        ? <PremiumBusinessHero homepage={homepage} slides={premiumSlides} fallbackImage={heroCover} onExplore={showBusinessVenues} onSearch={findVenue} searchFilters={searchFilters} onSearchSubmit={applySearch} />
        : <BookingHeroFallback homepage={homepage} cover={heroCover} onSearch={findVenue} searchFilters={searchFilters} onSearchSubmit={applySearch} />}

      {homepage.showSports !== false && (
        <section id="sports" className="hp-section" style={{ order: orderOf('sports') }}>
          <div className="hp-section-head">
            <div>
              <p className="hp-kicker">Make your move</p>
              <h2>What&apos;s your game?</h2>
            </div>
            <p className="hp-section-note">A little competition. A lot of good times.</p>
          </div>
          <SportCategoryGrid sports={displaySports} sportId={sportId} venueCounts={venueCounts} onSelect={(sport) => {
            const nextSportId = String(sportId) === String(sport.id) ? '' : sport.id;
            setBusinessId('');
            updateVenueUrl({ sportId: nextSportId, city, date, time });
            scrollToVenues();
          }} />
        </section>
      )}

      {homepage.showVenues !== false && (
        <div style={{ order: orderOf('venues') }}>
          <VenueShowcase
            venues={displayedVenues}
            city={city}
            loading={venuesQuery.isLoading}
            error={venuesQuery.isError}
            onRetry={() => venuesQuery.refetch()}
            onClear={clearFilters}
          />
        </div>
      )}

      {homepage.showCities !== false && cityCards.length > 0 && (
        <section className="hp-section" style={{ order: orderOf('cities') }}>
          <div className="hp-section-head">
            <div>
              <p className="hp-kicker">Play closer to home</p>
              <h2>Find your local playing field.</h2>
            </div>
            <p className="hp-section-note">Explore by venue location.</p>
          </div>
          <div className="hp-city-grid">
            {cityCards.map((place) => (
              <CityDestinationCard
                key={place.city}
                city={place.city}
                count={place.count}
                onSelect={clearFilters}
              />
            ))}
          </div>
        </section>
      )}

      {homepage.showHowItWorks !== false && (
        <section id="how-it-works" className="hp-how" style={{ order: orderOf('howItWorks') }}>
          <div className="hp-how-intro">
            <p className="hp-kicker">From “let&apos;s play” to game on</p>
            <h2>Less organising.<br /><em>More playing.</em></h2>
            <p>Your next game is just a few steps away.</p>
          </div>
          <div className="hp-steps">
            {[['01', 'Find your spot', 'Explore venues by sport and location. Find the right fit for your game.'], ['02', 'Pick your time', 'Choose your court, date and duration. See the price before you book.'], ['03', 'Show up. Game on.', 'Complete your booking, bring your team and let the good games begin.']].map(([number, title, copy]) => (
              <div key={number} className="hp-step">
                <span className="hp-step-number">{number}</span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {homepage.showOwnerPromotion !== false && (
        <section className="hp-partner" style={{ order: orderOf('ownerPromotion') }}>
          <div>
            <p className="hp-eyebrow">For the people behind the courts</p>
            <h2>Your venue.<br />Their next great game.</h2>
            <p>Bring your courts, calendar and bookings together. Give more players a place to play.</p>
          </div>
          <div className="hp-partner-action">
            <span className="hp-partner-symbol" aria-hidden="true">↗</span>
            <button type="button" className="hp-button hp-lime" onClick={() => navigate('/owner/register')}>List your venue <span aria-hidden="true">→</span></button>
          </div>
        </section>
      )}

      {homepage.showTrust !== false && (
        <section className="hp-section" style={{ order: orderOf('trust') }}>
          <div className="hp-trust">
            {[
              [CalendarMonth, 'Your court. Your time.', 'Choose a specific court and a one-hour slot.'],
              [Bolt, 'Know before you book', 'Review prices and cancellation terms before payment.'],
              [Verified, 'The right place to play', 'Browse by branch location, so you know where to go.'],
            ].map(([Icon, title, copy]) => (
              <div key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <button type="button" className="hp-mobile-find" onClick={findVenue}>Find a venue</button>
    </div>
  );
}
