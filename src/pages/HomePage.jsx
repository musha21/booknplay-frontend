import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowForward, Bolt, CalendarMonth, Lock, Payments, Stadium, Verified } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useBusinesses, useHomepageConfig, useSports, useVenues } from '../hooks/useVenues';
import BookingHeroFallback from '../components/home/BookingHeroFallback';
import BusinessShowcase from '../components/home/BusinessShowcase';
import CityDestinationCard from '../components/home/CityDestinationCard';
import VenueShowcase from '../components/home/VenueShowcase';
import PremiumBusinessHero from '../components/home/PremiumBusinessHero';
import { SportCategoryGrid } from '../components/home/SportCategoryButton';
import { buildVenueSearchParams } from '../utils/searchParams';
import { venueCover, venuePrice, venueSportLabel } from '../utils/venue';

const HOME_VENUE_PARAMS = { size: 12, sort: 'createdAt,desc' };
const FALLBACK_SPORTS = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Swimming', 'Table Tennis'].map((name) => ({ id: name.toLowerCase(), name, fallback: true }));
const DEFAULT_ORDER = ['sports', 'venues', 'cities', 'howItWorks', 'businesses', 'ownerPromotion', 'trust'];
const orderedSelection = (items, ids = []) => ids?.length ? ids.map((id) => items.find((item) => String(item.id) === String(id))).filter(Boolean) : items;
const venueMatchesSport = (venue, sport) => !sport || [venue.sportId, venue.sport?.id].some((id) => String(id) === String(sport.id)) || String(venueSportLabel(venue)).toLowerCase().includes(sport.name.toLowerCase()) || venue.courts?.some((court) => String(court.sportName || court.sport?.name || '').toLowerCase().includes(sport.name.toLowerCase()));

export default function HomePage() {
  const navigate = useNavigate();
  const [sportId, setSportId] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('recommended');
  const [businessId, setBusinessId] = useState('');
  const sportsQuery = useSports();
  const businessesQuery = useBusinesses();
  const venuesQuery = useVenues(HOME_VENUE_PARAMS);
  const homepageQuery = useHomepageConfig();
  const homepage = homepageQuery.data || {};
  const sports = useMemo(() => sportsQuery.data || [], [sportsQuery.data]);
  const venues = useMemo(() => venuesQuery.data || [], [venuesQuery.data]);
  const displaySports = useMemo(() => orderedSelection(sports.length ? sports : FALLBACK_SPORTS, homepage.featuredSportIds), [sports, homepage.featuredSportIds]);
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
    return [...grouped.values()].slice(0, 6);
  }, [venues]);
  const businesses = useMemo(() => orderedSelection(businessesQuery.data || [], homepage.featuredBusinessIds), [businessesQuery.data, homepage.featuredBusinessIds]);
  const premiumSlides = homepage.premiumSliderEnabled === false ? [] : (homepage.premiumSlides || []);
  const heroCover = venues.map(venueCover).find(Boolean) || '';
  const matchingVenues = useMemo(() => {
    const result = venues.filter((venue) => venueMatchesSport(venue, selectedSport))
      .filter((venue) => !city || String(venue.city || venue.address || '').toLowerCase().includes(city.toLowerCase()))
      .filter((venue) => !businessId || String(venue.businessId) === String(businessId));
    if (sort === 'price') return [...result].sort((a, b) => venuePrice(a) - venuePrice(b));
    if (sort === 'newest') return [...result].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return result;
  }, [venues, selectedSport, city, businessId, sort]);
  const displayedVenues = useMemo(() => sportId || city || businessId ? matchingVenues : orderedSelection(matchingVenues, homepage.featuredVenueIds), [matchingVenues, sportId, city, businessId, homepage.featuredVenueIds]);
  const venueCounts = useMemo(() => Object.fromEntries(displaySports.map((sport) => [sport.id, venues.filter((venue) => venueMatchesSport(venue, sport)).length])), [displaySports, venues]);
  const sectionOrder = homepage.sectionOrder?.length ? homepage.sectionOrder : DEFAULT_ORDER;
  const orderOf = (section) => sectionOrder.includes(section) ? sectionOrder.indexOf(section) + 1 : 20;
  const searchParams = () => buildVenueSearchParams({ sportId: selectedSport?.fallback ? '' : sportId, city });
  const showBusinessVenues = (business) => { setBusinessId(business.businessId || business.id); setCity(''); document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="flex flex-col bg-canvas text-ink">
      {premiumSlides.length > 0
        ? <PremiumBusinessHero homepage={homepage} slides={premiumSlides} onExplore={showBusinessVenues} onSearch={() => navigate('/search')} />
        : <BookingHeroFallback homepage={homepage} cover={heroCover} onSearch={() => navigate('/search')} />}

      {homepage.showSports !== false && (
        <section className="section-container py-20 sm:py-24" style={{ order: orderOf('sports') }}>
          <p className="eyebrow">Choose your sport</p>
          <h2 className="section-title mt-2">What do you want to play?</h2>
          <SportCategoryGrid sports={displaySports} sportId={sportId} venueCounts={venueCounts} onSelect={(sport) => { setSportId(String(sportId) === String(sport.id) ? '' : sport.id); setTimeout(() => document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' }), 50); }} />
        </section>
      )}
      {homepage.showVenues !== false && <div style={{ order: orderOf('venues') }}><VenueShowcase venues={displayedVenues} loading={venuesQuery.isLoading} error={venuesQuery.isError} sort={sort} onSort={setSort} onRetry={() => venuesQuery.refetch()} onClear={() => { setSportId(''); setCity(''); setBusinessId(''); }} onViewAll={() => navigate(`/search?${searchParams()}`)} /></div>}
      {homepage.showCities !== false && cityCards.length > 0 && (
        <section className="section-container py-20 sm:py-24" style={{ order: orderOf('cities') }}>
          <p className="eyebrow">Browse by location</p>
          <h2 className="section-title mt-2">Find a venue in your city</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cityCards.map((place) => (
              <CityDestinationCard
                key={place.city}
                city={place.city}
                count={place.count}
                cover={place.cover}
                onSelect={() => { setCity(place.city); document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' }); }}
              />
            ))}
          </div>
        </section>
      )}
      {homepage.showHowItWorks !== false && (
        <section className="border-y border-line bg-surface py-20 sm:py-24" style={{ order: orderOf('howItWorks') }}>
          <div className="section-container">
            <p className="eyebrow">Three simple steps</p>
            <h2 className="section-title mt-2">Search, choose and play</h2>
            <div className="relative mt-10 grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-px bg-line md:block" />
              {[['01', 'Find a venue', 'Search by sport, city or venue name in the bar above.'], ['02', 'Pick a time', 'Compare locations, prices and available slots.'], ['03', 'Confirm your booking', 'Sign in to book. Payments use a development checkout until PayHere is live.']].map(([number, title, copy]) => (
                <div key={number} className="relative bg-surface md:px-2">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-canvas text-sm font-black text-navy-900">{number}</span>
                  <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {homepage.showBusinesses !== false && <div style={{ order: orderOf('businesses') }}><BusinessShowcase businesses={businesses} onViewBusiness={showBusinessVenues} /></div>}
      {homepage.showOwnerPromotion !== false && (
        <section className="section-container py-20 sm:py-24" style={{ order: orderOf('ownerPromotion') }}>
          <div className="overflow-hidden rounded-[28px] bg-navy-900 p-7 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-center">
              <div>
                <p className="eyebrow !text-lime-300">For sports businesses</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-.03em]">Showcase every venue under one business.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Manage locations, availability and bookings from a focused owner workspace.</p>
                <Button variant="contained" color="secondary" onClick={() => navigate('/owner/register')} endIcon={<ArrowForward />} className="!mt-7">List your business</Button>
              </div>
              <div className="grid grid-cols-3 gap-3">{[[Stadium, 'Venues'], [CalendarMonth, 'Bookings'], [Payments, 'Earnings']].map(([Icon, label]) => <div key={label} className="rounded-2xl bg-white/10 p-4"><Icon className="text-lime-300" /><strong className="mt-5 block text-sm">{label}</strong></div>)}</div>
            </div>
          </div>
        </section>
      )}
      {homepage.showTrust !== false && (
        <section className="border-t border-line bg-surface py-8" style={{ order: orderOf('trust') }}>
          <div className="section-container flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-bold text-muted">
            <span className="flex items-center gap-2"><Bolt className="text-lime-500" />Live availability</span>
            <span className="flex items-center gap-2"><Lock className="text-lime-500" />Sign in to book</span>
            <span className="flex items-center gap-2"><Verified className="text-lime-500" />Development payment until PayHere</span>
          </div>
        </section>
      )}
    </div>
  );
}
