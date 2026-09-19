import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, MenuItem, Skeleton, TextField } from '@mui/material';
import {
  ArrowForward, AutoAwesome, Bolt, CalendarMonth, CheckCircle, LocationOn,
  Lock, Payments, Search, Stadium, Verified,
} from '@mui/icons-material';
import { useSports, useVenues } from '../hooks/useVenues';
import VenueImage from '../components/ui/VenueImage';
import EmptyState from '../components/ui/EmptyState';
import { buildVenueSearchParams } from '../utils/searchParams';
import { sportIcon, venueCover, venuePrice, venueSportLabel } from '../utils/venue';
import { formatCurrency } from '../utils/formatters';

const HOME_VENUE_PARAMS = { size: 9, sort: 'createdAt,desc' };
const FALLBACK_SPORTS = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Swimming', 'Table Tennis']
  .map((name) => ({ id: name.toLowerCase(), name, fallback: true }));

const SPORT_THEMES = {
  cricket: { accent: '#a3e635', soft: '#ecfccb', deep: '#16351f', motif: 'pitch', action: 'Find cricket courts' },
  football: { accent: '#60a5fa', soft: '#dbeafe', deep: '#071d49', motif: 'field', action: 'Find football pitches' },
  futsal: { accent: '#60a5fa', soft: '#dbeafe', deep: '#071d49', motif: 'field', action: 'Find futsal pitches' },
  badminton: { accent: '#22d3ee', soft: '#cffafe', deep: '#083344', motif: 'arc', action: 'Find badminton courts' },
  basketball: { accent: '#fb923c', soft: '#ffedd5', deep: '#431407', motif: 'court', action: 'Find basketball courts' },
  volleyball: { accent: '#fb7185', soft: '#ffe4e6', deep: '#4c0519', motif: 'net', action: 'Find volleyball courts' },
  swimming: { accent: '#38bdf8', soft: '#e0f2fe', deep: '#082f49', motif: 'waves', action: 'Find swimming lanes' },
  pool: { accent: '#a78bfa', soft: '#ede9fe', deep: '#2e1065', motif: 'orbit', action: 'Find pool tables' },
  tennis: { accent: '#bef264', soft: '#ecfccb', deep: '#1a2e05', motif: 'court', action: 'Find tennis courts' },
  padel: { accent: '#bef264', soft: '#ecfccb', deep: '#1a2e05', motif: 'court', action: 'Find padel courts' },
};

const sportTheme = (name = '') => {
  const normalized = String(name).toLowerCase();
  const key = Object.keys(SPORT_THEMES).find((item) => normalized.includes(item));
  return SPORT_THEMES[key] || { accent: '#a3e635', soft: '#ecfccb', deep: '#061032', motif: 'orbit', action: `Find ${name || 'a'} venue` };
};

const venueMatchesSport = (venue, sport) => {
  if (!sport) return true;
  const name = sport.name.toLowerCase();
  if ([venue.sportId, venue.sport?.id].includes(sport.id)) return true;
  if (String(venueSportLabel(venue)).toLowerCase().includes(name)) return true;
  return venue.courts?.some((court) => String(court.sportName || court.sport?.name || '').toLowerCase().includes(name));
};

const nextWeekend = () => {
  const date = new Date();
  const days = (6 - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export default function HomePage() {
  const navigate = useNavigate();
  const [sportId, setSportId] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [venueSort, setVenueSort] = useState('recommended');
  const [activeStep, setActiveStep] = useState(0);
  const sportsQuery = useSports();
  const venuesQuery = useVenues(HOME_VENUE_PARAMS);
  const sports = useMemo(() => sportsQuery.data || [], [sportsQuery.data]);
  const venues = useMemo(() => venuesQuery.data || [], [venuesQuery.data]);
  const displaySports = sports.length ? sports : FALLBACK_SPORTS;
  const selectedSport = displaySports.find((sport) => String(sport.id) === String(sportId));
  const theme = sportTheme(selectedSport?.name);
  const cities = useMemo(
    () => [...new Set(venues.map((venue) => venue.city).filter(Boolean))].slice(0, 6),
    [venues]
  );
  const matchingVenues = useMemo(() => {
    const filtered = venues.filter((venue) => venueMatchesSport(venue, selectedSport))
      .filter((venue) => !city || String(venue.city || venue.address || '').toLowerCase().includes(city.toLowerCase()));
    const result = filtered.length || (!selectedSport && !city) ? filtered : venues;
    if (venueSort === 'price') return [...result].sort((a, b) => venuePrice(a) - venuePrice(b));
    if (venueSort === 'newest') return [...result].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return result;
  }, [venues, selectedSport, city, venueSort]);
  const heroVenue = matchingVenues[0] || venues[0];

  const themeStyle = {
    '--sport-accent': theme.accent,
    '--sport-soft': theme.soft,
    '--sport-deep': theme.deep,
  };

  const search = (event) => {
    event?.preventDefault();
    navigate(`/search?${buildVenueSearchParams({ sportId: selectedSport?.fallback ? '' : sportId, city, date })}`);
  };

  const selectSport = (sport) => setSportId((current) => String(current) === String(sport.id) ? '' : sport.id);

  const chooseDate = (value) => {
    const target = new Date();
    if (value === 'tomorrow') target.setDate(target.getDate() + 1);
    setDate(value === 'weekend' ? nextWeekend() : target.toISOString().slice(0, 10));
  };

  const scrollToVenues = (sport) => {
    selectSport(sport);
    window.setTimeout(() => document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="bg-canvas text-ink">
      <section className={`sport-reactive relative overflow-hidden border-b border-line ${theme.motif}`} style={themeStyle}>
        <div className="sport-orb sport-orb-one" aria-hidden="true" />
        <div className="sport-orb sport-orb-two" aria-hidden="true" />
        <div className="section-container relative grid min-h-[620px] min-w-0 items-stretch lg:grid-cols-[1.02fr_.98fr]">
          <div className="relative z-10 flex min-w-0 flex-col justify-center py-12 pr-0 lg:py-20 lg:pr-10">
            <div className="animate-slide-up">
              <p className="eyebrow !text-[var(--sport-deep)] dark:!text-[var(--sport-accent)]">Book courts across Sri Lanka</p>
              <h1 className="mt-4 max-w-2xl text-[2.6rem] font-black leading-[.94] tracking-[-.06em] text-[var(--sport-deep)] min-[410px]:text-5xl sm:text-6xl xl:text-7xl">
                What are you<br />
                <span className="relative inline-block">
                  playing today?
                  <span className="absolute inset-x-0 -bottom-1 h-2 -rotate-1 rounded-full bg-[var(--sport-accent)] opacity-80" aria-hidden="true" />
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-[color:color-mix(in_srgb,var(--sport-deep)_72%,transparent)] sm:text-lg">
                Pick a sport, choose your time, and get onto the court without the group-chat chaos.
              </p>
            </div>

            <div className="mt-7 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Choose a sport">
              {sportsQuery.isLoading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} variant="rounded" width={92} height={76} />) : displaySports.slice(0, 7).map((sport) => {
                const Icon = sportIcon(sport.name);
                const itemTheme = sportTheme(sport.name);
                const selected = String(sportId) === String(sport.id);
                return (
                  <button
                    key={sport.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectSport(sport)}
                    className={`sport-choice group ${selected ? 'sport-choice-selected' : ''}`}
                    style={{ '--choice-accent': itemTheme.accent, '--choice-soft': itemTheme.soft, '--choice-deep': itemTheme.deep }}
                  >
                    <span className="sport-choice-icon"><Icon fontSize="small" /></span>
                    <span className="max-w-20 truncate">{sport.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-extrabold text-[var(--sport-deep)]">
              <span className="mr-1 opacity-65">Quick date</span>
              {[['today', 'Today'], ['tomorrow', 'Tomorrow'], ['weekend', 'This weekend']].map(([value, label]) => (
                <button key={value} type="button" onClick={() => chooseDate(value)} className="rounded-full border border-[color:color-mix(in_srgb,var(--sport-deep)_18%,transparent)] bg-white/60 px-3 py-1.5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white">{label}</button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[390px] min-w-0 overflow-hidden rounded-t-[32px] bg-[var(--sport-deep)] lg:rounded-none lg:rounded-bl-[42px]">
            <div key={`${heroVenue?.id || 'empty'}-${sportId}`} className="sport-image-enter h-full">
              <VenueImage src={venueCover(heroVenue)} alt={heroVenue?.name || `${selectedSport?.name || 'Sports'} venue`} className="h-full min-h-[390px] w-full object-cover opacity-90" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--sport-deep)] via-transparent to-[color:color-mix(in_srgb,var(--sport-accent)_35%,transparent)]" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-2 text-xs font-extrabold text-white backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--sport-accent)]" /> Live venues
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-[color:color-mix(in_srgb,var(--sport-deep)_82%,transparent)] p-4 text-white shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:left-5 sm:max-w-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[var(--sport-accent)]">{selectedSport?.name || 'Featured near you'}</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="min-w-0"><p className="truncate text-lg font-black">{heroVenue?.name || 'Your next game starts here'}</p><p className="mt-1 flex items-center gap-1 text-xs text-white/70"><LocationOn className="!text-sm" />{heroVenue?.city || 'Explore venues across Sri Lanka'}</p></div>
                {heroVenue && <Button size="small" color="secondary" variant="contained" onClick={() => navigate(`/venues/${heroVenue.id}`)} className="!shrink-0">View</Button>}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={search} className="section-container relative z-20 -mt-1 pb-8 lg:-mt-10">
          <div className="surface-card grid gap-3 p-4 shadow-2xl shadow-navy-900/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:p-5">
            <TextField select label="Sport" value={sportId} onChange={(event) => setSportId(event.target.value)}>
              <MenuItem value="">All sports</MenuItem>
              {displaySports.map((sport) => <MenuItem key={sport.id} value={sport.id}>{sport.name}</MenuItem>)}
            </TextField>
            <TextField label="Location" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Kandy, Colombo…" />
            <TextField label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().slice(0, 10) } }} />
            <Button type="submit" variant="contained" color="secondary" startIcon={<Search />} className="!px-7">{selectedSport ? theme.action : 'Find a court'}</Button>
          </div>
          {cities.length > 0 && <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs"><span className="shrink-0 font-bold text-muted">Popular:</span>{cities.slice(0, 4).map((place) => <button key={place} type="button" onClick={() => setCity(place)} className={`shrink-0 rounded-full border px-3 py-1.5 font-bold transition ${city === place ? 'border-navy-900 bg-navy-900 text-white dark:border-lime-400 dark:bg-lime-400 dark:text-navy-900' : 'border-line bg-surface text-muted hover:border-lime-400 hover:text-ink'}`}>{place}</button>)}</div>}
        </form>
      </section>

      <section id="sports" className="section-container py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Choose your game</p><h2 className="section-title">Every sport has its own energy.</h2><p className="section-subtitle">Tap a sport to reshape your recommendations and jump straight to matching venues.</p></div>
          <span className="hidden items-center gap-2 text-sm font-bold text-muted sm:flex"><AutoAwesome className="text-lime-500" /> Interactive sport themes</span>
        </div>
        <div className="mt-8 grid auto-rows-[150px] grid-cols-2 gap-3 md:grid-cols-4">
          {displaySports.slice(0, 8).map((sport, index) => {
            const Icon = sportIcon(sport.name);
            const itemTheme = sportTheme(sport.name);
            const count = venues.filter((venue) => venueMatchesSport(venue, sport)).length;
            const featured = index < 2;
            const imageVenue = venues.find((venue) => venueMatchesSport(venue, sport));
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => scrollToVenues(sport)}
                className={`sport-bento group ${featured ? 'col-span-2 row-span-2' : ''}`}
                style={{ '--choice-accent': itemTheme.accent, '--choice-soft': itemTheme.soft, '--choice-deep': itemTheme.deep }}
              >
                {featured && venueCover(imageVenue) && <VenueImage src={venueCover(imageVenue)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-45" />}
                <span className="sport-bento-pattern" aria-hidden="true" />
                <span className="relative z-10 flex h-full flex-col items-start justify-between text-left">
                  <span className="sport-bento-icon"><Icon /></span>
                  <span><strong className={`${featured ? 'text-2xl sm:text-3xl' : 'text-base'} block font-black tracking-[-.03em]`}>{sport.name}</strong><small className="mt-1 block font-bold opacity-65">{count ? `${count} venue${count === 1 ? '' : 's'}` : 'Explore venues'}</small></span>
                </span>
                <ArrowForward className="absolute bottom-4 right-4 z-10 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden border-y border-line bg-navy-900 py-4 text-white" aria-label="BooknPlay activity">
        <div className="activity-marquee flex w-max items-center gap-10 text-sm font-extrabold">
          {[`${venues.length} live venues to explore`, `${sports.length || displaySports.length} sports across Sri Lanka`, 'Clear prices before you book', 'Instant booking confirmation', `${venues.length} live venues to explore`, `${sports.length || displaySports.length} sports across Sri Lanka`, 'Clear prices before you book', 'Instant booking confirmation'].map((message, index) => <span key={`${message}-${index}`} className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-lime-400" />{message}</span>)}
        </div>
      </section>

      <section id="venues" className="scroll-mt-24 border-b border-line bg-surface py-20">
        <div className="section-container">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div><p className="eyebrow">Ready when you are</p><h2 className="section-title">{selectedSport ? `${selectedSport.name} venues` : 'Courts available near you'}</h2><p className="section-subtitle">Real partner venues with clear locations and starting prices.</p></div>
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Sort venues">
              {[['recommended', 'Recommended'], ['price', 'Lowest price'], ['newest', 'Recently added']].map(([value, label]) => <button key={value} type="button" aria-pressed={venueSort === value} onClick={() => setVenueSort(value)} className={`calendar-filter ${venueSort === value ? 'calendar-filter-active' : ''}`}>{label}</button>)}
            </div>
          </div>

          {venuesQuery.isLoading ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={360} />)}</div> : venuesQuery.isError ? <div className="mt-8"><EmptyState icon={Search} title="Could not load venues" description="The public venue list is unavailable right now. Check that the API is running, then try again." actionLabel="Retry" onAction={() => venuesQuery.refetch()} /></div> : matchingVenues.length === 0 ? <div className="mt-8"><EmptyState icon={Search} title="No matching venues yet" description="Try another sport or clear your location to see more places to play." actionLabel="Clear filters" onAction={() => { setSportId(''); setCity(''); }} /></div> : (
            <div key={`${sportId}-${city}-${venueSort}`} className="venue-results mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {matchingVenues.slice(0, 6).map((venue, index) => (
                <article key={venue.id} className="venue-discovery-card surface-card group overflow-hidden" style={{ '--card-index': index }}>
                  <div className="relative overflow-hidden"><VenueImage src={venueCover(venue)} alt={venue.name} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-navy-900/75 via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-navy-900 backdrop-blur">{venueSportLabel(venue)}</span><p className="absolute bottom-4 left-4 flex items-center gap-1 text-xs font-bold text-white"><LocationOn fontSize="small" />{venue.city || venue.formattedAddress || 'Sri Lanka'}</p></div>
                  <div className="p-5"><h3 className="text-lg font-black text-ink">{venue.name}</h3><div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4"><div><span className="block text-xs text-muted">From</span><strong className="text-ink">{formatCurrency(venuePrice(venue), venue.currency || 'LKR')} <small className="font-medium text-muted">/ hour</small></strong></div><Button variant="contained" onClick={() => navigate(`/venues/${venue.id}`)} endIcon={<ArrowForward />}>Check times</Button></div></div>
                </article>
              ))}
            </div>
          )}
          <div className="mt-8 text-center"><Button onClick={() => navigate(`/search?${buildVenueSearchParams({ sportId: selectedSport?.fallback ? '' : sportId, city, date })}`)} endIcon={<ArrowForward />}>View all matching venues</Button></div>
        </div>
      </section>

      {cities.length > 0 && <section className="section-container py-20"><p className="eyebrow">Play around the island</p><h2 className="section-title">Find a game in your city.</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cities.map((place, index) => { const cityVenues = venues.filter((venue) => venue.city === place); const cover = cityVenues[0]; return <button key={place} type="button" onClick={() => { setCity(place); document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' }); }} className="city-card group relative min-h-52 overflow-hidden rounded-[24px] bg-navy-900 text-left text-white"><VenueImage src={venueCover(cover)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" /><span className="relative z-10 flex h-full min-h-52 flex-col justify-end p-6"><small className="font-bold text-lime-300">{cityVenues.length} venue{cityVenues.length === 1 ? '' : 's'}</small><strong className="mt-1 text-2xl font-black">{place}</strong><span className="mt-3 flex items-center gap-1 text-xs font-bold text-white/75">Explore courts <ArrowForward className="!text-base transition group-hover:translate-x-1" /></span></span><span className="absolute right-4 top-4 z-10 text-5xl font-black text-white/10">0{index + 1}</span></button>; })}</div></section>}

      <section id="how-it-works" className="border-y border-line bg-surface py-20">
        <div className="section-container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div><p className="eyebrow">One smooth flow</p><h2 className="section-title">From “shall we play?” to confirmed.</h2><p className="section-subtitle">Explore each step to see how BooknPlay removes the planning friction.</p><div className="mt-7 space-y-2">{[['Pick your game', 'Choose a sport, city and date.'], ['See real availability', 'Compare courts, times and clear prices.'], ['Book and play', 'Pay securely and receive confirmation.']].map(([title, copy], index) => <button key={title} type="button" onMouseEnter={() => setActiveStep(index)} onFocus={() => setActiveStep(index)} onClick={() => setActiveStep(index)} className={`booking-step w-full rounded-2xl border p-4 text-left transition ${activeStep === index ? 'border-lime-400 bg-lime-50 dark:bg-lime-950/20' : 'border-line bg-canvas/50'}`}><span className="flex gap-4"><strong className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activeStep === index ? 'bg-lime-300 text-navy-900' : 'bg-surface text-muted'}`}>0{index + 1}</strong><span><b className="block text-ink">{title}</b><small className="mt-1 block text-muted">{copy}</small></span></span></button>)}</div></div>
          <div className="relative min-h-[390px] overflow-hidden rounded-[28px] bg-navy-900 p-5 text-white shadow-2xl shadow-navy-900/15 sm:p-8"><div className="brand-grid absolute inset-0 opacity-40" /><div key={activeStep} className="step-preview-enter relative z-10 h-full">{activeStep === 0 && <div className="grid h-full place-items-center"><div className="w-full max-w-md"><p className="text-xs font-extrabold uppercase tracking-widest text-lime-300">Start with a feeling</p><h3 className="mt-3 text-4xl font-black">What do you want to play?</h3><div className="mt-8 grid grid-cols-3 gap-3">{displaySports.slice(0, 3).map((sport) => { const Icon = sportIcon(sport.name); return <div key={sport.id} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur"><Icon /><span className="mt-2 block text-xs font-bold">{sport.name}</span></div>; })}</div></div></div>}{activeStep === 1 && <div className="grid h-full place-items-center"><div className="w-full max-w-md rounded-2xl bg-white p-5 text-navy-900"><div className="flex items-center justify-between"><b>Evening availability</b><span className="chip-lime">Live</span></div><div className="mt-5 grid grid-cols-3 gap-2">{['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'].map((time, index) => <span key={time} className={`rounded-xl border p-3 text-center text-xs font-bold ${index === 2 ? 'border-lime-400 bg-lime-100' : 'border-slate-200'}`}>{time}</span>)}</div></div></div>}{activeStep === 2 && <div className="grid h-full place-items-center text-center"><div><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-300 text-navy-900"><CheckCircle sx={{ fontSize: 42 }} /></span><h3 className="mt-5 text-3xl font-black">You’re booked.</h3><p className="mt-2 text-slate-300">Court confirmed. Time to message the team.</p></div></div>}</div></div>
        </div>
      </section>

      <section className="section-container py-20"><div className="overflow-hidden rounded-[30px] bg-navy-900 text-white"><div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="eyebrow !text-lime-300">Built for venue owners too</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em] sm:text-4xl">Your courts. More players. Less admin.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Manage availability, walk-ins and earnings from one focused workspace.</p><Button variant="contained" color="secondary" onClick={() => navigate('/owner/register')} endIcon={<ArrowForward />} className="!mt-7">List your venue</Button></div><div className="rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur"><div className="grid grid-cols-3 gap-2">{[[Stadium, '8', 'Courts'], [CalendarMonth, '24', 'Bookings'], [Payments, '82%', 'Occupancy']].map(([Icon, value, label]) => <div key={label} className="rounded-xl bg-white/10 p-3"><Icon className="!text-lg text-lime-300" /><strong className="mt-3 block text-xl">{value}</strong><small className="text-slate-400">{label}</small></div>)}</div><div className="mt-3 rounded-xl bg-white p-4 text-navy-900"><div className="flex items-center justify-between"><b className="text-sm">Today’s operations</b><span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Live</span></div><div className="mt-4 flex h-24 items-end gap-2">{[35, 48, 42, 68, 54, 82, 72, 92].map((height, index) => <span key={index} className="flex-1 rounded-t bg-navy-100" style={{ height: `${height}%`, background: index === 7 ? '#a3e635' : undefined }} />)}</div></div></div></div></div></section>

      <section className="border-t border-line bg-surface py-10"><div className="section-container flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-bold text-muted"><span className="flex items-center gap-2"><Bolt className="text-lime-500" /> Live availability</span><span className="flex items-center gap-2"><Lock className="text-lime-500" /> Secure checkout</span><span className="flex items-center gap-2"><Verified className="text-lime-500" /> Verified venue partners</span></div></section>
    </div>
  );
}
