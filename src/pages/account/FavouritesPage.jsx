import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import EmptyState from '../../components/ui/EmptyState';
import VenueCard from '../../components/ui/VenueCard';
import { useVenues } from '../../hooks/useVenues';
import useFavoritesStore from '../../stores/favoritesStore';

export default function FavouritesPage() {
  const navigate = useNavigate();
  const savedVenueIds = useFavoritesStore((state) => state.savedVenueIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const venuesQuery = useVenues();
  const allVenues = venuesQuery.data || [];

  const favouriteVenues = useMemo(() => {
    if (!savedVenueIds.length || !allVenues.length) return [];
    return allVenues.filter((venue) => savedVenueIds.some((id) => String(id) === String(venue.id)));
  }, [allVenues, savedVenueIds]);

  const isLoading = venuesQuery.isPending;

  return (
    <div className="customer-panel p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Saved places</p>
          <h2 className="customer-card-title mt-1 flex items-center gap-2">
            Favourite venues
            {savedVenueIds.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-lime/20 px-2.5 py-0.5 text-xs font-semibold text-lime">
                {savedVenueIds.length}
              </span>
            )}
          </h2>
          <p className="customer-body mt-1">
            Keep the venues and bookable spaces you love within easy reach.
          </p>
        </div>

        {favouriteVenues.length > 0 && (
          <button
            type="button"
            className="btn-secondary self-start sm:self-center text-sm py-2 px-4"
            onClick={() => navigate('/')}
          >
            Find more venues
          </button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={320} className="rounded-2xl" />
            ))}
          </div>
        ) : favouriteVenues.length === 0 ? (
          <div className="rounded-2xl border border-line bg-canvas/60 p-4 sm:p-8">
            <EmptyState
              icon={FavoriteBorder}
              title="No favourite venues yet"
              description="Click the heart icon on any venue card to save it here for fast booking and quick access."
              actionLabel="Explore venues"
              onAction={() => navigate('/')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favouriteVenues.map((venue, index) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                variant="home"
                actionLabel="Book slot"
                saved={true}
                onToggleSaved={() => toggleFavorite(venue.id, venue.name)}
                autoplayOffsetMs={index * 400}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
