import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Favorite, FavoriteBorder, Place } from '@mui/icons-material';
import { motion, useReducedMotion } from 'motion/react';
import VenueCarousel from './VenueCarousel';
import { formatCurrency } from '../../utils/formatters';
import { sportAccent, venueBusinessLogo, venueDisplayAddress, venueOperatorName, venuePrice, venueSportLabel } from '../../utils/venue';
import { formatDistanceKm } from '../../utils/geo';
import { buttonPress, fadeUp, reducedFade } from '../../motion/variants';
import mediaUrl from '../../utils/mediaUrl';

const SAMPLE_SLOTS = [
  ['10:00 AM', '5:00 PM', '7:00 PM'],
  ['2:00 PM', '5:00 PM', '9:00 PM'],
  ['5:00 PM', '7:00 PM', '9:00 PM'],
];

function venueSportLabels(venue) {
  const sports = [...new Set(
    (venue.courts || [])
      .map((court) => court?.sportName || court?.sport?.name)
      .filter(Boolean)
      .map((name) => String(name).trim()),
  )];
  if (sports.length) return sports.slice(0, 3);
  const primary = venue.sportName || venue.venueType || venue.sportType;
  return primary ? [primary] : ['Multi-sport'];
}

export default function VenueCard({ venue, variant = 'default', actionLabel = 'View Slots', showSlots = false, slotIndex = 0, saved = false, onToggleSaved, autoplayOffsetMs = 0 }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  if (!venue?.id) return null;
  const sport = venueSportLabel(venue);
  const sportLabels = venueSportLabels(venue);
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
    const availabilityBadge = venue.availableCourtCount != null
      ? `${venue.availableCourtCount} Court${venue.availableCourtCount === 1 ? '' : 's'} Available`
      : venue.isOpen === false ? 'Closed Today' : 'Available Today';
    const distanceBadgeText = venue.distanceLabel || formatDistanceKm(venue.distanceKm);

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
        {/* Image area */}
        <div className="hp-venue-image">
          <VenueCarousel venue={venue} className="h-full" imageClassName="h-full w-full object-cover" alt={venue.name} autoplayOffsetMs={autoplayOffsetMs} showLogo={false} />

          {/* Sport tag top-left */}
          <span className="hp-venue-tag">{sport}</span>

          {/* Distance badge bottom-left when geolocation is active */}
          {distanceBadgeText && (
            <span className="hp-venue-distance-tag absolute left-2.5 bottom-2.5 bg-slate-900/80 text-lime-400 text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
              <Place style={{ fontSize: 11 }} />
              {distanceBadgeText}
            </span>
          )}

          {/* Favourite button top-right */}
          <button
            type="button"
            className={`hp-favourite ${saved ? 'is-saved' : ''}`}
            aria-label={`${saved ? 'Unsave' : 'Save'} ${venue.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSaved?.();
            }}
          >
            {saved ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </button>
        </div>

        {/* Card body */}
        <div className="hp-venue-body">
          {/* Availability badge */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-extrabold text-lime-700 dark:text-lime-400 bg-lime-100 dark:bg-lime-950/60 px-2 py-0.5 rounded-md leading-tight">
              {availabilityBadge}
            </span>
          </div>

          {/* Venue name */}
          <h3 className="hp-venue-name">{venue.name}</h3>

          {/* Operator / business name with logo avatar */}
          {operator && (
            <div className="flex items-center gap-1.5 mt-0.5 mb-1">
              <Avatar
                alt=""
                src={mediaUrl(venueBusinessLogo(venue))}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  fontWeight: 800,
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {operator.charAt(0).toUpperCase()}
              </Avatar>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {operator}
              </span>
            </div>
          )}

          {/* Sport labels */}
          <div className="flex flex-wrap gap-1 mt-1 mb-2">
            {sportLabels.map((label) => (
              <span
                key={label}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${sportAccent(label)}22`, color: sportAccent(label) === '#a3e635' ? '#4a7c0a' : 'currentColor' }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Price + CTA */}
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
        <VenueCarousel venue={venue} className="h-full" imageClassName="h-full w-full object-cover" alt={venue.name} autoplayOffsetMs={autoplayOffsetMs} />
        <span style={{ background: `${sportAccent(sport)}e8` }}>{sport}</span>
        {showSlots && <button type="button" className="home-venue-save" aria-label={`${saved ? 'Unsave' : 'Save'} ${venue.name}`} onClick={onToggleSaved}>{saved ? <Favorite /> : <FavoriteBorder />}</button>}
      </div>
      <div className="home-venue-content">
        <h3>{venue.name}</h3>
        {operator && <p className="home-venue-business">Operated by {operator}</p>}
        <p className="home-venue-location">
          <Place fontSize="small" />
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
