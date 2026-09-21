import { useNavigate, useParams } from 'react-router-dom';
import { Button, Chip, Skeleton } from '@mui/material';
import { ArrowBack, ArrowForward, LocationOn, Schedule, SportsTennis } from '@mui/icons-material';
import { useVenue } from '../hooks/useVenues';
import VenueImage from '../components/ui/VenueImage';
import EmptyState from '../components/ui/EmptyState';
import { venueCover } from '../utils/venue';

export default function VenueDetailPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const query = useVenue(venueId);
  const venue = query.data;
  if (query.isLoading) return <main className="page-shell"><div className="section-container py-10"><Skeleton variant="rounded" height={420} /><Skeleton className="!mt-5" width="40%" height={50} /></div></main>;
  if (!venue) return <main className="page-shell"><div className="section-container py-16"><EmptyState icon={SportsTennis} title="Venue not found" description="This venue may no longer be listed." actionLabel="Back to search" onAction={() => navigate('/search')} /></div></main>;

  return (
    <main className="page-shell py-8 sm:py-12"><div className="section-container">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"><ArrowBack fontSize="small" /> Back</button>
      <section className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-navy-900 shadow-2xl"><VenueImage src={venueCover(venue)} alt={venue.name} className="absolute inset-0 h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9"><Chip label={venue.city || 'Sri Lanka'} color="secondary" /><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{venue.name}</h1><p className="mt-2 flex items-center gap-1 text-sm text-slate-200"><LocationOn className="text-lime-300" /> {venue.address || venue.city}</p></div></section>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
        <section className="surface-card p-5 sm:p-7"><p className="eyebrow">Choose your space</p><h2 className="mt-2 section-title">Courts and facilities</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{venue.courts?.length ? venue.courts.map((court) => <article key={court.id} className="rounded-2xl border border-line bg-canvas/60 p-5 transition hover:border-lime-400"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold text-ink">{court.name}</h3><p className="mt-1 text-sm text-muted">{court.sportName || court.courtType || 'Sports court'}</p></div><SportsTennis className="text-lime-600" /></div><div className="mt-5 flex items-end justify-between border-t border-line pt-4"><div><span className="block text-xs text-muted">Hourly rate</span><strong className="text-ink">LKR {Number(court.hourlyRate || court.price || 0).toLocaleString()}</strong></div><Button variant="contained" endIcon={<ArrowForward />} onClick={() => navigate(`/venues/${venue.id}/slots?courtId=${court.id}`)}>Choose slots</Button></div></article>) : <div className="md:col-span-2"><EmptyState icon={SportsTennis} title="No courts published" description="This venue has not published bookable courts yet." /></div>}</div></section>
        <aside className="space-y-4"><div className="surface-card p-5"><h2 className="font-extrabold text-ink">Venue details</h2><dl className="mt-4 space-y-4 text-sm"><div className="flex gap-3"><LocationOn className="text-lime-600" /><div><dt className="font-bold text-ink">Location</dt><dd className="text-muted">{venue.address || venue.city}</dd></div></div><div className="flex gap-3"><Schedule className="text-lime-600" /><div><dt className="font-bold text-ink">Booking</dt><dd className="text-muted">Anyone can view availability. You only sign in as a customer when you confirm a slot.</dd></div></div></dl></div></aside>
      </div>
    </div></main>
  );
}
