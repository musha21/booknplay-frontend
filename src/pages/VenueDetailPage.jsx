import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Chip, Skeleton } from '@mui/material';
import { ArrowBack, ArrowForward, Favorite, FavoriteBorder, LocationOn, Schedule, SportsTennis, Star } from '@mui/icons-material';
import { useVenue, useVenueReviews } from '../hooks/useVenues';
import VenueCarousel from '../components/ui/VenueCarousel';
import VenueMap from '../components/maps/VenueMap';
import EmptyState from '../components/ui/EmptyState';
import { sportIcon, venueDisplayAddress, venueGoogleMapsUrl, venueOperatorName } from '../utils/venue';
import { resourceLabelForCourt } from '../utils/courtResource';
import { rememberVenue } from '../utils/recentlyViewed';
import { formatDistanceKm, haversineKm } from '../utils/geo';
import { formatTime } from '../utils/formatters';
import useAuthStore from '../stores/authStore';
import useFavoritesStore from '../stores/favoritesStore';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function VenueDetailPage() {
  const { venueId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = useVenue(venueId);
  const reviewsQuery = useVenueReviews(venueId);
  const venue = query.data;
  const isCustomer = useAuthStore((state) => state.isAuthenticated && state.role === 'CUSTOMER');
  const saved = useFavoritesStore((state) => state.isFavorite(venueId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  useEffect(() => {
    if (venueId) rememberVenue(venueId);
  }, [venueId]);

  if (query.isLoading) return <main className="page-shell"><div className="section-container space-y-5 py-10"><Skeleton variant="rounded" className="!h-[min(56vw,36rem)] !min-h-[220px] w-full !bg-surface" /><Skeleton width="40%" height={50} className="!bg-surface" /></div></main>;
  if (!venue) return <main className="page-shell"><div className="section-container py-16"><EmptyState icon={SportsTennis} title="Venue not found" description="This venue may no longer be listed." actionLabel="Browse venues" onAction={() => navigate('/search')} /></div></main>;

  const address = venueDisplayAddress(venue);
  const mapsUrl = venueGoogleMapsUrl(venue);
  const operator = venueOperatorName(venue);
  const fromLat = Number(params.get('fromLat'));
  const fromLng = Number(params.get('fromLng'));
  const distance = formatDistanceKm(haversineKm(fromLat, fromLng, venue.latitude, venue.longitude));
  const hours = [...(venue.operatingHours || [])].sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek));
  const reviews = reviewsQuery.data || [];
  const goSlots = (courtId) => navigate(`/venues/${venue.id}/slots${courtId ? `?courtId=${courtId}` : ''}`);

  const locationLabel = (
    <>
      <LocationOn className="shrink-0 text-lime-300" fontSize="small" />
      <span className="underline-offset-2">{address}</span>
    </>
  );

  return (
    <main className="page-shell py-8 sm:py-12"><div className="section-container">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"><ArrowBack fontSize="small" /> Back</button>
      <section className="relative h-[min(56vw,36rem)] min-h-[220px] w-full overflow-hidden rounded-[28px] bg-navy-900 shadow-2xl">
        <VenueCarousel
          venue={venue}
          className="absolute inset-0 z-0"
          imageClassName="h-full w-full object-cover"
          alt={venue.name}
          showLogo={false}
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-navy-900 via-navy-900/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[2] p-6 text-white sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label={venue.city || 'Sri Lanka'} color="secondary" />
            {venue.rating ? (
              <Chip icon={<Star />} label={`${Number(venue.rating).toFixed(1)} (${venue.reviewCount || reviews.length})`} color="secondary" />
            ) : null}
            {distance ? <Chip label={distance} color="secondary" /> : null}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{venue.name}</h1>
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-white/80 underline decoration-white/40 transition hover:text-white hover:decoration-lime-300"
            >
              {locationLabel}
            </a>
          ) : (
            <p className="mt-2 flex items-center gap-1 text-sm text-white/80">{locationLabel}</p>
          )}
        </div>
      </section>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
        <section className="customer-panel p-5 sm:p-7">
          <p className="eyebrow">Choose your space</p>
          <h2 className="mt-2 section-title">Bookable spaces</h2>
          {venue.description && <p className="customer-body mt-4">{venue.description}</p>}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {venue.courts?.length ? (
              venue.courts.map((court) => {
                const SpaceIcon = sportIcon(court.sportName || court.sport?.name || venue.sportName);
                const resourceType = resourceLabelForCourt(court);
                return (
                  <article key={court.id} className="rounded-2xl border border-line bg-canvas/60 p-5 transition hover:border-lime-400">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="customer-card-title">{court.name}</h3>
                        <p className="customer-body mt-1 !text-sm">{resourceType} · {court.sportName || venue.sportName || 'Sport'}</p>
                      </div>
                      <SpaceIcon className="text-lime-600" />
                    </div>
                    <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <span className="block text-xs text-muted">Hourly rate</span>
                        <strong className="text-ink">LKR {Number(court.hourlyRate || court.price || 0).toLocaleString()}</strong>
                      </div>
                      <Button className="w-full sm:w-auto" variant="contained" endIcon={<ArrowForward />} onClick={() => goSlots(court.id)}>Choose slots</Button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="md:col-span-2">
                <EmptyState icon={SportsTennis} title="No bookable spaces published" description="This venue has not published any bookable spaces yet." />
              </div>
            )}
          </div>
          {venue.amenities?.length > 0 && (
            <div className="mt-8">
              <h3 className="customer-card-title">Amenities</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {venue.amenities.map((item) => <Chip key={item} label={item} />)}
              </div>
            </div>
          )}
          {(venue.rules?.length || venue.additionalRules) && (
            <div className="mt-8">
              <h3 className="customer-card-title">House rules</h3>
              <ul className="customer-body mt-3 list-disc space-y-1 pl-5">
                {(venue.rules || []).map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
              {venue.additionalRules && <p className="customer-body mt-3">{venue.additionalRules}</p>}
            </div>
          )}
          <div className="mt-8">
            <h3 className="customer-card-title">Reviews</h3>
            {reviews.length === 0 ? (
              <p className="customer-body mt-3">No public reviews yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-line p-4">
                    <p className="font-bold">{review.customerName} · {review.rating}/5</p>
                    <p className="customer-body mt-1">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="customer-panel overflow-hidden p-0">
            <VenueMap className="h-56 w-full" venues={[venue]} selectedId={venue.id} center={{ lat: venue.latitude, lng: venue.longitude }} zoom={15} />
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block px-5 py-3 text-sm font-bold text-lime-700">
                Open in Google Maps
              </a>
            )}
          </div>
          <div className="customer-panel p-5">
            <h2 className="customer-card-title">Venue details</h2>
            <dl className="customer-body mt-4 space-y-4 !text-sm">
              <div className="flex gap-3">
                <LocationOn className="text-lime-600" />
                <div>
                  <dt className="font-bold text-ink">Location</dt>
                  <dd className="text-muted">{address}{distance ? ` · ${distance}` : ''}</dd>
                </div>
              </div>
              {operator && (
                <div className="flex gap-3">
                  <div className="text-lime-600 font-bold">🏢</div>
                  <div>
                    <dt className="font-bold text-ink">Operator</dt>
                    <dd className="text-muted">{operator}</dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Schedule className="text-lime-600" />
                <div>
                  <dt className="font-bold text-ink">Opening hours</dt>
                  <dd className="text-muted">
                    {hours.length ? hours.map((row) => (
                      <div key={row.id || row.dayOfWeek}>
                        {String(row.dayOfWeek).slice(0, 3)} {row.closed ? 'Closed' : `${formatTime(row.openTime)} – ${formatTime(row.closeTime)}`}
                      </div>
                    )) : 'Hours not published yet.'}
                  </dd>
                </div>
              </div>
            </dl>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
              onClick={() => {
                if (!isCustomer) {
                  navigate('/auth/login', { state: { from: { pathname: `/venues/${venue.id}` }, reason: 'favourite' } });
                  return;
                }
                toggleFavorite(venue.id, venue.name);
              }}
            >
              {saved ? <Favorite className="text-lime-600" /> : <FavoriteBorder />}
              {saved ? 'Saved' : 'Save favourite'}
            </button>
          </div>
        </aside>
      </div>
      <div className="venue-sticky-book">
        <div>
          <strong>{venue.name}</strong>
          <p>{venue.city}{distance ? ` · ${distance}` : ''}</p>
        </div>
        <Button variant="contained" endIcon={<ArrowForward />} onClick={() => goSlots(venue.courts?.[0]?.id)}>Choose slots</Button>
      </div>
    </div></main>
  );
}
