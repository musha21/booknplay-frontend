import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import EmptyState from '../ui/EmptyState';
import VenueCard from '../ui/VenueCard';
import useAuthStore from '../../stores/authStore';
import { staggerContainer } from '../../motion/variants';

export default function VenueShowcase({ venues = [], loading, error, onRetry, onClear, city = 'Kandy' }) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomer = useAuthStore((state) => state.isAuthenticated && state.role === 'CUSTOMER');
  const [savedIds, setSavedIds] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);

  const toggleSaved = (venueId) => {
    if (!isCustomer) {
      toast.info('Sign in to save venues');
      navigate('/auth/login', { state: { from: location, reason: 'favourite' } });
      return;
    }
    setSavedIds((current) => (
      current.includes(venueId) ? current.filter((id) => id !== venueId) : [...current, venueId]
    ));
  };

  const visible = useMemo(
    () => (savedOnly ? venues.filter((venue) => savedIds.includes(venue.id)) : venues),
    [venues, savedOnly, savedIds],
  );

  const displayCity = city || 'Kandy';

  return (
    <section id="venues" className="hp-section hp-venues scroll-mt-24">
      <div className="hp-section-head">
        <div>
          <p className="hp-kicker">Available near you</p>
          <h2>Play today in {displayCity}.</h2>
        </div>
        <div>
          <p className="hp-section-note">Places ready for your next game.</p>
        </div>
      </div>
      <div className="hp-results-toolbar">
        <span>{venues.length ? `${visible.length} venue${visible.length === 1 ? '' : 's'}` : 'Find your next place to play'}</span>
        <button type="button" className={`hp-filter-saved ${savedOnly ? 'is-selected' : ''}`} aria-pressed={savedOnly} onClick={() => setSavedOnly((current) => !current)}>
          Saved ({savedIds.length})
        </button>
      </div>
      {loading ? <div className="hp-venue-grid">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} variant="rounded" height={320} />)}</div>
        : error ? <EmptyState icon={Search} title="Could not load venues" description="The venue list is unavailable right now." actionLabel="Retry" onAction={onRetry} />
          : !visible.length ? (
            <EmptyState
              icon={Search}
              title={savedOnly ? 'No saved venues' : 'No matching venues'}
              description={
                savedOnly
                  ? 'Save a venue to see it here.'
                  : displayCity && displayCity !== 'Kandy'
                    ? `No venues matched in ${displayCity}. Try widening your search or choosing another sport.`
                    : 'Try another sport or clear the selected location.'
              }
              actionLabel={savedOnly ? 'Show all venues' : 'Clear filters'}
              onAction={savedOnly ? () => setSavedOnly(false) : onClear}
            />
          ) : (
            <motion.div className="hp-venue-grid" variants={reduced ? undefined : staggerContainer(0.07)} initial={reduced ? false : 'hidden'} animate={reduced ? undefined : 'show'}>
              {visible.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  variant="home"
                  actionLabel="View slots"
                  saved={savedIds.includes(venue.id)}
                  onToggleSaved={() => toggleSaved(venue.id)}
                />
              ))}
            </motion.div>
          )}
    </section>
  );
}
