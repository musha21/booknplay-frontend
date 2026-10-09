import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MyLocation, Search, Tune } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import EmptyState from '../ui/EmptyState';
import VenueCard from '../ui/VenueCard';
import useAuthStore from '../../stores/authStore';
import useFavoritesStore from '../../stores/favoritesStore';
import { staggerContainer } from '../../motion/variants';

export default function VenueShowcase({
  venues = [],
  loading,
  error,
  onRetry,
  onClear,
  city = 'Kandy',
  heading,
  onEditFilters,
  filterSummary,
  onUseLocation,
  locationStatus = 'idle',
  hasLocation = false,
}) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomer = useAuthStore((state) => state.isAuthenticated && state.role === 'CUSTOMER');
  const savedIds = useFavoritesStore((state) => state.savedVenueIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const [savedOnly, setSavedOnly] = useState(false);

  const toggleSaved = (venue) => {
    if (!isCustomer) {
      toast.info('Sign in to save venues');
      navigate('/auth/login', { state: { from: location, reason: 'favourite' } });
      return;
    }
    toggleFavorite(venue.id, venue.name);
  };

  const visible = useMemo(
    () => (savedOnly ? venues.filter((venue) => savedIds.some((id) => String(id) === String(venue.id))) : venues),
    [venues, savedOnly, savedIds],
  );

  const displayCity = city || 'Kandy';

  return (
    <section id="venues" className="hp-section hp-venues scroll-mt-24">
      <div className="hp-section-head">
        <div>
          <p className="hp-kicker">Available near you</p>
          <h2>{heading || `Play today in ${displayCity}.`}</h2>
        </div>
        <div>
          <p className="hp-section-note">Places ready for your next game.</p>
        </div>
      </div>

      {/* Results toolbar */}
      <div className="hp-results-toolbar flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {venues.length ? `${visible.length} venue${visible.length === 1 ? '' : 's'}` : 'Find your next place to play'}
        </span>

        {/* Filter summary chips */}
        {filterSummary && (
          <span className="text-xs bg-lime-100 dark:bg-lime-950/50 text-lime-800 dark:text-lime-300 px-2 py-0.5 rounded-md font-semibold">
            {filterSummary}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Use my location shortcut (only when a handler is provided) */}
          {onUseLocation && (
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition ${
                hasLocation
                  ? 'bg-slate-900 text-lime-400 border-slate-900 dark:bg-slate-800 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-lime-400'
              }`}
              onClick={onUseLocation}
              disabled={locationStatus === 'loading'}
              aria-label="Use my location"
            >
              <MyLocation fontSize="small" className={locationStatus === 'loading' ? 'animate-spin text-lime-400' : ''} />
              <span>
                {locationStatus === 'loading' ? 'Locating…' : hasLocation ? 'Location Active' : 'Use my location'}
              </span>
            </button>
          )}

          {/* Edit Filters shortcut */}
          {onEditFilters && (
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-lime-400 text-slate-700 dark:text-slate-300 rounded-lg transition"
              onClick={onEditFilters}
              aria-label="Edit filters"
            >
              <Tune fontSize="small" />
              <span>Edit Filters</span>
            </button>
          )}

          {/* Saved toggle */}
          <button
            type="button"
            className={`hp-filter-saved ${savedOnly ? 'is-selected' : ''}`}
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly((current) => !current)}
          >
            Saved ({savedIds.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} variant="rounded" height={320} />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={Search} title="Could not load venues" description="The venue list is unavailable right now." actionLabel="Retry" onAction={onRetry} />
      ) : !visible.length ? (
        <EmptyState
          icon={Search}
          title={savedOnly ? 'No saved venues' : 'No matching venues'}
          description={
            savedOnly
              ? 'Save a venue to see it here.'
              : displayCity && displayCity !== 'Kandy'
                ? `No venues matched in ${displayCity}.`
                : 'No venues matched your selected filters. Try choosing another sport, widening distance, or resetting filters.'
          }
          actionLabel={savedOnly ? 'Show all venues' : 'Reset filters'}
          onAction={savedOnly ? () => setSavedOnly(false) : onClear}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-5"
          variants={reduced ? undefined : staggerContainer(0.05)}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'show'}
        >
          {visible.map((venue, index) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              variant="home"
              actionLabel="View slots"
              saved={savedIds.some((id) => String(id) === String(venue.id))}
              onToggleSaved={() => toggleSaved(venue)}
              autoplayOffsetMs={index * 400}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
