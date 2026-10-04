import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Favorite, FavoriteBorder, LocationOn } from '@mui/icons-material';
import { motion, useReducedMotion } from 'motion/react';
import VenueCarousel from './VenueCarousel';
import { formatCurrency } from '../../utils/formatters';
import { sportAccent, venueDisplayAddress, venueOperatorName, venuePrice, venueSportLabel } from '../../utils/venue';
import { buttonPress, fadeUp, reducedFade } from '../../motion/variants';

const SAMPLE_SLOTS = [
  ['10:00 AM', '5:00 PM', '7:00 PM'],
  ['2:00 PM', '5:00 PM', '9:00 PM'],
  ['5:00 PM', '7:00 PM', '9:00 PM'],
];

function venueAmenities(venue) {
  const raw = venue.amenities || venue.features || [];
  const labels = (Array.isArray(raw) ? raw : [])
    .map((item) => (typeof item === 'string' ? item : item?.name))
    .filter(Boolean);
  if (labels.length) return labels.slice(0, 3);
  return [...new Set((venue.courts || []).map((court) => court.sportName || court.sport?.name).filter(Boolean))].slice(0, 3);
}

export default function VenueCard({ venue, variant = 'default', actionLabel = 'View venue', showSlots = false, slotIndex = 0, saved = false, onToggleSaved }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  if (!venue?.id) return null;
  const sport = venueSportLabel(venue);
  const amenities = venueAmenities(venue);
  const operator = venueOperatorName(venue);
  const locationText = venueDisplayAddress(venue);

  if (variant === 'home') {
    const goToVenue = () => navigate(`/venues/${venue.id}`);
    const onCardKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goToVenue();
      }
    };
    return (
      <motion.article
        variants={reduced ? reducedFade : fadeUp}
        className="hp-venue-card"
        whileHover={reduced ? undefined : { y: -4 }}
        role="link"
        tabIndex={0}
        aria-label={`View ${venue.name}`}
        onClick={goToVenue}
        onKeyDown={onCardKeyDown}
      >
        <div className="hp-venue-image">
          <VenueCarousel venue={venue} className="h-full" imageClassName="h-full w-full object-cover" alt={venue.name} />
          <span className="hp-venue-tag">{sport}</span>
          <button
            type="button"
            className={`hp-favourite ${saved ? 'is-saved' : ''}`}
            aria-label={`${saved ? 'Unsave' : 'Save'} ${venue.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSaved?.();
            }}
          >
            {saved ? <Favorite /> : <FavoriteBorder />}
          </button>
        </div>
        <div className="hp-venue-body">
          <h3>{venue.name}</h3>
          {operator && <p className="hp-venue-operator text-xs text-muted">Operated by {operator}</p>}
          <p className="hp-venue-location">
            <LocationOn fontSize="small" />
            {locationText}
          </p>
          {amenities.length > 0 && (
            <div className="hp-amenities">
              {amenities.map((item) => <span key={item}>{item}</span>)}
            </div>
          )}
          <div className="hp-venue-bottom">
            <div className="hp-price">
              {formatCurrency(venuePrice(venue), venue.currency || 'LKR')}
              <small> / hr</small>
            </div>
            <button
              type="button"
              className="hp-view-slots"
              onClick={(event) => {
                event.stopPropagation();
                goToVenue();
              }}
            >
              {actionLabel} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      variants={reduced ? reducedFade : fadeUp}
      className="home-venue-card"
      whileHover={reduced ? undefined : { y: -4 }}
    >
      <div className="home-venue-image">
        <VenueCarousel venue={venue} className="h-full" imageClassName="h-full w-full object-cover" alt={venue.name} />
        <span style={{ background: `${sportAccent(sport)}e8` }}>{sport}</span>
        {showSlots && <button type="button" className="home-venue-save" aria-label={`${saved ? 'Unsave' : 'Save'} ${venue.name}`} onClick={onToggleSaved}>{saved ? <Favorite /> : <FavoriteBorder />}</button>}
      </div>
      <div className="home-venue-content">
        <h3>{venue.name}</h3>
        {operator && <p className="home-venue-business">Operated by {operator}</p>}
        <p className="home-venue-location">
          <LocationOn fontSize="small" />
          {locationText}
        </p>

        {showSlots && (
          <div className="home-slot-list" aria-label="Sample one-hour slots">
            {SAMPLE_SLOTS[slotIndex % SAMPLE_SLOTS.length].map((time) => <span key={time}>{time}</span>)}
          </div>
        )}
        <div className="home-venue-meta">
          <div>
            <span>From</span>
            <strong>
              {formatCurrency(venuePrice(venue), venue.currency || 'LKR')}
              <small> / hr</small>
            </strong>
          </div>
          <motion.span whileTap={reduced ? undefined : buttonPress}>
            <Button variant="text" onClick={() => navigate(`/venues/${venue.id}`)}>{actionLabel}</Button>
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}
