import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bolt, CalendarMonth, Verified } from '@mui/icons-material';
import { toast } from 'sonner';
import { useBusinesses, useHomepageConfig, useSports, useVenues } from '../hooks/useVenues';
import BookingHeroFallback from '../components/home/BookingHeroFallback';
import CityDestinationCard from '../components/home/CityDestinationCard';
import PublicPromotionsStrip from '../components/home/PublicPromotionsStrip';
import VenueShowcase from '../components/home/VenueShowcase';
import MobileAppBanner from '../components/home/MobileAppBanner';
import { SportCategoryGrid } from '../components/home/SportCategoryButton';
import AccordionGallery from '../components/ui/AccordionGallery';
import heroArena from '../assets/brand/midnight-multisport-arena.png';
import { MAIN_SPORT_FALLBACKS, MAIN_SPORT_PRIORITY, curateMainSports, curateShowcaseSports, mergeDynamicSports } from '../constants/sports';
import { buildVenueQuery, LAUNCH_CITY } from '../utils/searchParams';
import mediaUrl from '../utils/mediaUrl';
import { facilityLabel, venueCover, venueMatchingPrice, venueSportLabel } from '../utils/venue';
import { formatDistanceKm, haversineKm } from '../utils/geo';
import { getActiveAreas, venueInKandyServiceArea, venueMatchesArea } from '../config/locationConfig';

const slideInWindow = (slide) => {
  const today = new Date().toISOString().slice(0, 10);
  if (slide?.startsAt && String(slide.startsAt).slice(0, 10) > today) return false;
  if (slide?.expiresAt && String(slide.expiresAt).slice(0, 10) < today) return false;
  return true;
};

const HOME_VENUE_SIZE = 60;
const FEATURED_CITIES = ['Kandy', 'Colombo', 'Negombo', 'Dehiwala', 'Kurunegala'];
const DEFAULT_ORDER = ['sports', 'venues', 'cities', 'howItWorks', 'trust', 'ownerPromotion'];

const orderedSelection = (items, ids = []) => (ids?.length ? ids.map((id) => items.find((item) => String(item.id) === String(id))).filter(Boolean) : items);

const resolveSportPriority = (sport) => {
  const names = [sport?.displayName, sport?.name].filter(Boolean).map((value) => String(value).toLowerCase());
  return MAIN_SPORT_PRIORITY.find(({ label, matches }) => (
    names.includes(label.toLowerCase())
    || matches.some((term) => names.some((name) => name.includes(term)))
  ));
};

const sportNameTerms = (sport) => {
  const names = [sport?.displayName, sport?.name].filter(Boolean).map((value) => String(value).toLowerCase());
  const priority = resolveSportPriority(sport);
  return [...new Set([...names, ...(priority?.matches || [])])];
};

const textMatchesSport = (raw, sport) => {
  const text = String(raw || '').toLowerCase().trim();
  if (!text || text === 'multi-sport venue') return false;
  const priority = resolveSportPriority(sport);
  const label = String(sport?.displayName || sport?.name || '').toLowerCase();
  if (label === '8-ball pool' || priority?.label === '8-Ball Pool') {
    return (text.includes('8-ball') || text.includes('billiard') || text.includes('pool'))
      && !text.includes('swim');
  }
  if (label === 'swimming' || priority?.label === 'Swimming') {
    return text.includes('swim') || (text.includes('lane') && !text.includes('pool table'));
  }
  const terms = sportNameTerms(sport);
  return terms.some((term) => term && text.includes(term));
};

const venueMatchesSport = (venue, sport) => {
  if (!sport || sport.all) return true;
  const sportKey = String(sport.id || '');
  if (sportKey && [venue.sportId, venue.sport?.id].some((id) => id != null && String(id) === sportKey)) return true;
  if (sportKey && venue.courts?.some((court) => [court.sportId, court.sport?.id].some((id) => id != null && String(id) === sportKey))) {
    return true;
  }
  if (textMatchesSport(venue.sportName, sport) || textMatchesSport(venueSportLabel(venue), sport)) return true;
  if (venue.courts?.some((court) => textMatchesSport(court.sportName || court.sport?.name, sport))) return true;
  return false;
};

const ALL_SPORTS = { id: '', all: true, displayName: 'All sports', name: 'All sports' };

const normalizeFacility = (facility) => (facility && facility !== 'all' ? String(facility).toUpperCase() : '');

const isActiveCourt = (court) => !court?.status || String(court.status).toUpperCase() === 'ACTIVE';

/**
 * Requires a SINGLE active court to satisfy both the selected sport and the selected
 * facility, so a venue offering "Cricket - Outdoor" and "Carrom - Indoor" never matches
 * a "Cricket + Indoor" filter across two different courts.
 */
const venueMatchesCourt = (venue, sport, facility) => {
  const fac = normalizeFacility(facility);
  const sportKey = sport && !sport.all ? String(sport.id || '') : '';
  if (!sportKey && !fac) return true;

  const courts = (venue.courts || []).filter(isActiveCourt);
  if (courts.length) {
    return courts.some((court) => {
      const sportOk = !sportKey || [court.sportId, court.sport?.id].some((id) => id != null && String(id) === sportKey);
      const facOk = !fac || String(court.facilityType || '').toUpperCase() === fac;
      return sportOk && facOk;
    });
  }

  // Venue without a courts payload: fall back to text/venue-level matching.
  if (sportKey && !fac) return venueMatchesSport(venue, sport);
  if (!sportKey && fac) return String(venue.venueType || '').toUpperCase().includes(fac);
  return false;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const sportsQuery = useSports();
  useBusinesses();

  // Date & time filters — drive the venue query and hero filter bar
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');

  // Fetch without city=Kandy lock; service-area membership is applied client-side.
  const venueParams = useMemo(() => {
    const q = buildVenueQuery({ size: HOME_VENUE_SIZE });
    if (filterDate) q.date = filterDate;
    if (filterTime) q.time = filterTime;
    return q;
  }, [filterDate, filterTime]);
  const venuesQuery = useVenues(venueParams);
  const homepageQuery = useHomepageConfig();
  const homepage = homepageQuery.data || {};

  // Hash scroll to #venues is handled instantly by CustomerScrollManager in Layout.

  const sports = useMemo(() => sportsQuery.data || [], [sportsQuery.data]);
  const venues = useMemo(
    () => (venuesQuery.data || []).filter(venueInKandyServiceArea),
    [venuesQuery.data],
  );

  const filterSports = useMemo(() => {
    const source = sports.length ? sports : MAIN_SPORT_FALLBACKS;
    const featured = orderedSelection(source, homepage.featuredSportIds);
    const curated = curateMainSports(featured);
    const selected = curated.length === MAIN_SPORT_PRIORITY.length ? curated : curateMainSports(source);
    return mergeDynamicSports(selected, source);
  }, [sports, homepage.featuredSportIds]);

  const showcaseSports = useMemo(
    () => curateShowcaseSports(sports.length ? sports : MAIN_SPORT_FALLBACKS),
    [sports],
  );

  // Instant Filter State - Default to All sports, All facilities & All Kandy
  const [selectedSportId, setSelectedSportId] = useState(urlParams.get('sportId') || '');
  const [facility, setFacility] = useState(urlParams.get('facilityType') || 'all');
  const [selectedArea, setSelectedArea] = useState(urlParams.get('area') || 'all');
  const [distanceKm, setDistanceKm] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedBusinessLabel, setSelectedBusinessLabel] = useState('');

  const activeSport = useMemo(() => {
    if (!selectedSportId) return ALL_SPORTS;
    return (
      filterSports.find((s) => String(s.id) === String(selectedSportId))
      || sports.find((s) => String(s.id) === String(selectedSportId))
      || ALL_SPORTS
    );
  }, [selectedSportId, filterSports, sports]);

  // Geolocation Handler
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationStatus('active');
        setSortBy('nearest');
        toast.success('Location updated!');
      },
      (err) => {
        console.warn('Geolocation failed or denied:', err);
        setLocationStatus('denied');
        toast.info('Location permission unavailable. Distance filter disabled.');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  // Instant Filtering & Sorting Logic
  const filteredVenues = useMemo(() => {
    let list = venues
      .filter((v) => venueMatchesCourt(v, activeSport, facility))
      .filter((v) => venueMatchesArea(v, selectedArea));

    if (selectedBusinessId) {
      list = list.filter((v) => String(v.businessId || v.ownerBusinessId || '') === String(selectedBusinessId));
    }

    // Calculate actual distance only when coordinates are present
    if (userLocation?.lat && userLocation?.lng) {
      list = list.map((v) => {
        const km = haversineKm(userLocation.lat, userLocation.lng, v.latitude, v.longitude);
        return { ...v, distanceKm: km, distanceLabel: formatDistanceKm(km) };
      });

      if (distanceKm && distanceKm !== 'all') {
        const maxDist = Number(distanceKm);
        list = list.filter((v) => v.distanceKm != null && v.distanceKm <= maxDist);
      }
    } else {
      list = list.map((v) => ({ ...v, distanceKm: null, distanceLabel: null }));
    }

    // Apply Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'nearest' && userLocation) {
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      }
      const priceOf = (v) => venueMatchingPrice(v, { sportId: activeSport?.all ? '' : activeSport?.id, facility });
      if (sortBy === 'price_desc') {
        return priceOf(b) - priceOf(a);
      }
      // Default: price_asc
      return priceOf(a) - priceOf(b);
    });
  }, [venues, activeSport, facility, selectedArea, distanceKm, sortBy, userLocation, selectedBusinessId]);

  // Dynamic Heading Calculation
  const showcaseHeading = useMemo(() => {
    const activeAreas = getActiveAreas();
    const matchedArea = activeAreas.find((a) => a.value === selectedArea || a.id === selectedArea);
    const areaLabel = matchedArea && matchedArea.value ? matchedArea.name : LAUNCH_CITY;
    const facilityPart = facility !== 'all' ? ` ${facilityLabel(facility)}` : '';
    const partnerPart = selectedBusinessLabel ? ` · ${selectedBusinessLabel}` : '';
    if (activeSport?.all) {
      return `All Venues${facilityPart} in ${areaLabel}${partnerPart}`.replace('All Venues  ', 'All Venues ');
    }
    const sportLabel = activeSport.displayName || activeSport.name || 'Venue';
    return `${sportLabel}${facilityPart} Venues in ${areaLabel}${partnerPart}`;
  }, [activeSport, facility, selectedArea, selectedBusinessLabel]);

  // Reset Filters to Default
  const handleResetFilters = () => {
    setSelectedSportId('');
    setFacility('all');
    setSelectedArea('all');
    setDistanceKm('');
    setSortBy(userLocation ? 'nearest' : 'price_asc');
    setFilterDate('');
    setFilterTime('');
    setSelectedBusinessId('');
    setSelectedBusinessLabel('');
  };

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

  const premiumSlides = useMemo(() => {
    if (homepage.premiumSliderEnabled === false) return [];
    return (homepage.premiumSlides || []).filter((slide) => slide.enabled !== false && slideInWindow(slide));
  }, [homepage.premiumSliderEnabled, homepage.premiumSlides]);

  const premiumAccordionItems = useMemo(
    () => premiumSlides.map((slide) => ({
      image: mediaUrl(slide.imageUrl) || heroArena,
      label: slide.headline || slide.badge || 'Premium court',
      alt: slide.headline || 'Premium court',
      businessId: slide.businessId,
    })),
    [premiumSlides],
  );

  const venueCounts = useMemo(
    () => Object.fromEntries(showcaseSports.map((sport) => [sport.id, venues.filter((venue) => venueMatchesCourt(venue, sport, facility)).length])),
    [showcaseSports, venues, facility],
  );

  const orderOf = (section) => DEFAULT_ORDER.indexOf(section) + 1;
  const scrollToVenues = useCallback(() => {
    window.requestAnimationFrame(() => {
      document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // Filter summary for VenueShowcase toolbar
  const filterSummary = useMemo(() => {
    const sportLabel = activeSport?.displayName || activeSport?.name || '';
    const activeAreas = getActiveAreas();
    const matchedArea = activeAreas.find((a) => a.value === selectedArea || a.id === selectedArea);
    const areaLabel = matchedArea && matchedArea.value ? matchedArea.name : '';
    const parts = [];
    if (sportLabel && !activeSport?.all) parts.push(sportLabel);
    if (facility && facility !== 'all') parts.push(facilityLabel(facility));
    if (areaLabel) parts.push(areaLabel);
    if (selectedBusinessLabel) parts.push(selectedBusinessLabel);
    return parts.join(' · ') || null;
  }, [activeSport, facility, selectedArea, selectedBusinessLabel]);

  const showBusinessVenues = ({ businessId, label } = {}) => {
    const id = String(businessId || '').trim();
    if (!id) {
      setSelectedBusinessId('');
      setSelectedBusinessLabel('');
      scrollToVenues();
      return;
    }
    setSelectedBusinessId(id);
    setSelectedBusinessLabel(String(label || '').trim());
    scrollToVenues();
  };

  const findVenue = () => {
    const search = document.getElementById('home-search');
    if (search) search.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else scrollToVenues();
  };

  const filterProps = {
    sports: filterSports,
    selectedSportId,
    onSelectSport: setSelectedSportId,
    selectedArea,
    onSelectArea: setSelectedArea,
    facility,
    onChangeFacility: setFacility,
    distanceKm,
    onChangeDistance: setDistanceKm,
    sortBy,
    onChangeSort: setSortBy,
    userLocation,
    locationStatus,
    onFetchLocation: handleFetchLocation,
    onResetFilters: handleResetFilters,
    isPanelOpen,
    onTogglePanel: () => setIsPanelOpen((open) => !open),
    resultCount: filteredVenues.length,
    filterDate,
    onChangeDate: setFilterDate,
    filterTime,
    onChangeTime: setFilterTime,
    onFindVenue: scrollToVenues,
  };

  return (
    <div className="home-page">
      <BookingHeroFallback
        homepage={homepage}
        cover={heroArena}
        onSearch={findVenue}
        filterProps={filterProps}
      />

      {homepage.showSports !== false && (
        <section id="sports" className="hp-section" style={{ order: orderOf('sports') }}>
          <div className="hp-section-head">
            <div>
              <p className="hp-kicker">Make your move</p>
              <h2>What&apos;s your game?</h2>
            </div>
            <p className="hp-section-note">A little competition. A lot of good times.</p>
          </div>
          <SportCategoryGrid
            sports={showcaseSports}
            sportId={selectedSportId}
            venueCounts={venueCounts}
            onSelect={(sport) => {
              setSelectedSportId((current) => (String(current) === String(sport.id) ? '' : sport.id));
              scrollToVenues();
            }}
          />
        </section>
      )}

      <PublicPromotionsStrip />

      {premiumAccordionItems.length > 0 && (
        <section id="premium-courts" className="hp-section" style={{ order: orderOf('sports') }} aria-label="Premium courts">
          <div className="hp-section-head">
            <div>
              <p className="hp-kicker">Featured partners</p>
              <h2>Premium courts</h2>
            </div>
            <p className="hp-section-note">Expand a panel, then tap again to see their venues below.</p>
          </div>
          <AccordionGallery
            items={premiumAccordionItems}
            accentColor="#C7F84B"
            overlayColor="#061032"
            textColor="#ffffff"
            grayscale
            trigger="click"
            height={420}
            defaultIndex={0}
            autoPlay={homepage.premiumSliderAutoplay !== false}
            autoPlayInterval={(Math.min(3, Math.max(2, Number(homepage.premiumSliderSeconds) || 2.5)) * 1000)}
            onItemActivate={(item) => {
              if (item?.businessId) {
                showBusinessVenues({ businessId: item.businessId, label: item.label });
              }
            }}
          />
        </section>
      )}

      {homepage.showVenues !== false && (
        <div style={{ order: orderOf('venues') }}>
          <VenueShowcase
            venues={filteredVenues}
            heading={showcaseHeading}
            city={LAUNCH_CITY}
            selectedSportId={activeSport?.all ? '' : activeSport?.id}
            selectedSportLabel={activeSport?.all ? '' : (activeSport?.displayName || activeSport?.name)}
            facility={facility !== 'all' ? facility : ''}
            loading={venuesQuery.isPending || (venuesQuery.isFetching && filteredVenues.length === 0)}
            error={venuesQuery.isError}
            onRetry={() => venuesQuery.refetch()}
            onClear={handleResetFilters}
            filterSummary={filterSummary}
            onUseLocation={handleFetchLocation}
            locationStatus={locationStatus}
            hasLocation={Boolean(userLocation?.lat && userLocation?.lng)}
            onEditFilters={() => {
              const search = document.getElementById('home-search');
              if (search) search.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setIsPanelOpen(true);
            }}
          />
        </div>
      )}

      <section className="hp-section hp-app-banner-section" style={{ order: orderOf('venues') }} aria-label="Booknplay mobile app">
        <MobileAppBanner />
      </section>

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
                onSelect={() => {
                  setSelectedArea(place.city);
                  scrollToVenues();
                }}
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
