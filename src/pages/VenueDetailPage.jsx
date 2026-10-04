import { useNavigate, useParams } from 'react-router-dom';
import { Button, Chip, Skeleton } from '@mui/material';
import { ArrowBack, ArrowForward, LocationOn, Schedule, SportsTennis } from '@mui/icons-material';
import { useVenue } from '../hooks/useVenues';
import VenueCarousel from '../components/ui/VenueCarousel';
import EmptyState from '../components/ui/EmptyState';
import { sportIcon, venueDisplayAddress, venueGoogleMapsUrl, venueOperatorName } from '../utils/venue';
import { resourceLabelForCourt } from '../utils/courtResource';

export default function VenueDetailPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const query = useVenue(venueId);
  const venue = query.data;
  if (query.isLoading) return <main className="page-shell"><div className="section-container space-y-5 py-10"><Skeleton variant="rounded" className="!h-[min(56vw,36rem)] !min-h-[220px] w-full !bg-surface" /><Skeleton width="40%" height={50} className="!bg-surface" /></div></main>;
  if (!venue) return <main className="page-shell"><div className="section-container py-16"><EmptyState icon={SportsTennis} title="Venue not found" description="This venue may no longer be listed." actionLabel="Browse venues" onAction={() => navigate('/#venues')} /></div></main>;

  const address = venueDisplayAddress(venue);
  const mapsUrl = venueGoogleMapsUrl(venue);
  const operator = venueOperatorName(venue);
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
          <Chip label={venue.city || 'Sri Lanka'} color="secondary" />
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
                      <Button className="w-full sm:w-auto" variant="contained" endIcon={<ArrowForward />} onClick={() => navigate(`/venues/${venue.id}/slots?courtId=${court.id}`)}>Choose slots</Button>
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
        </section>
        <aside className="space-y-4">
          <div className="customer-panel p-5">
            <h2 className="customer-card-title">Venue details</h2>
            <dl className="customer-body mt-4 space-y-4 !text-sm">
              <div className="flex gap-3">
                <LocationOn className="text-lime-600" />
                <div>
                  <dt className="font-bold text-ink">Location</dt>
                  <dd className="text-muted">
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line underline-offset-2 transition hover:text-ink hover:decoration-lime-500"
                      >
                        {address}
                      </a>
                    ) : (
                      address
                    )}
                  </dd>
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
                  <dt className="font-bold text-ink">Booking</dt>
                  <dd className="text-muted">Anyone can view availability. You only sign in as a customer when you confirm a slot.</dd>
                </div>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div></main>
  );
}
