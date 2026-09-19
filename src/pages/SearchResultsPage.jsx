import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, MenuItem, Skeleton, TextField } from '@mui/material';
import { FilterList, Search, SportsSoccer } from '@mui/icons-material';
import { useSports, useVenues } from '../hooks/useVenues';
import VenueCard from '../components/ui/VenueCard';
import EmptyState from '../components/ui/EmptyState';
import { buildVenueSearchParams } from '../utils/searchParams';

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const [sportId, setSportId] = useState(params.get('sportId') || '');
  const [city, setCity] = useState(params.get('city') || '');
  const [name, setName] = useState(params.get('name') || '');
  const sports = useSports().data || [];
  const queryParams = useMemo(() => ({
    sportId: params.get('sportId') || undefined,
    city: params.get('city') || undefined,
    name: params.get('name') || undefined,
    size: 24,
    sort: 'createdAt,desc',
  }), [params]);
  const venuesQuery = useVenues(queryParams);
  const venues = venuesQuery.data || [];

  const apply = (event) => {
    event?.preventDefault();
    setParams(buildVenueSearchParams({ sportId, city, name }));
  };
  const clear = () => {
    setSportId('');
    setCity('');
    setName('');
    setParams({});
  };

  return (
    <main className="page-shell py-10 sm:py-14">
      <div className="section-container">
        <p className="eyebrow">Explore venues</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Find your next court</h1>
        <p className="mt-2 text-sm text-muted">
          {venuesQuery.isLoading ? 'Searching available venues…' : `${venues.length} venue${venues.length === 1 ? '' : 's'} found`}
        </p>
        <div className="mt-8 grid gap-7 lg:grid-cols-[280px_1fr]">
          <form onSubmit={apply} className="surface-card h-fit space-y-4 p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-extrabold text-ink"><FilterList /> Filters</h2>
              <Button size="small" onClick={clear}>Clear</Button>
            </div>
            <TextField fullWidth label="Venue name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField select fullWidth label="Sport" value={sportId} onChange={(e) => setSportId(e.target.value)}>
              <MenuItem value="">All sports</MenuItem>
              {sports.map((sport) => <MenuItem key={sport.id} value={sport.id}>{sport.name}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="City or area" value={city} onChange={(e) => setCity(e.target.value)} />
            <Button fullWidth type="submit" variant="contained" startIcon={<Search />}>Apply filters</Button>
          </form>
          <section aria-label="Venue results">
            {venuesQuery.isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <Skeleton key={item} variant="rounded" height={340} />)}</div>
            ) : venuesQuery.isError ? (
              <EmptyState icon={SportsSoccer} title="Could not load venues" description="The public venue list failed to load. Restart the API after the listing fix, then try again." actionLabel="Retry" onAction={() => venuesQuery.refetch()} />
            ) : venues.length === 0 ? (
              <EmptyState icon={SportsSoccer} title="No matching venues" description="Try removing a filter or searching another area." actionLabel="Reset filters" onAction={clear} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {venues.map((venue) => <VenueCard key={venue.id} venue={venue} actionLabel="View slots" />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
