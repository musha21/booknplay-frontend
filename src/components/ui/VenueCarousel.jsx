import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import VenueImage from './VenueImage';
import { businessInitials, venueBusinessLogo, venueMediaList } from '../../utils/venueMedia';
import { venueSportLabel } from '../../utils/venue';
import { heroSlide, reducedHero } from '../../motion/variants';

const AUTOPLAY_MS = 4000;

function LogoBadge({ venue, owner, className = '' }) {
  const logo = venueBusinessLogo(venue, owner);
  const label = venue?.businessName || owner?.businessName || 'Business';
  return (
    <span
      className={`absolute bottom-3 left-3 z-10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-navy-900 text-xs font-black text-lime-300 shadow-md ${className}`}
      aria-label={label}
    >
      {logo ? (
        <img src={logo} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        businessInitials(label)
      )}
    </span>
  );
}

export default function VenueCarousel({
  venue,
  owner,
  className = '',
  imageClassName = 'h-44 w-full object-cover',
  showLogo = true,
  alt,
}) {
  const reduced = useReducedMotion();
  const images = venueMediaList(venue);
  const sportName = venueSportLabel(venue);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const labelId = useId();
  const count = images.length;
  const safeIndex = count ? ((index % count) + count) % count : 0;
  const current = count ? images[safeIndex] : '';
  const autoplay = count > 1 && !reduced && !paused;

  const go = useCallback((next) => {
    if (count <= 1) return;
    setDirection(next > safeIndex || (safeIndex === count - 1 && next === 0) ? 1 : -1);
    setIndex(next);
  }, [count, safeIndex]);

  const step = useCallback((delta) => {
    if (count <= 1) return;
    setDirection(delta);
    setIndex((currentIndex) => (currentIndex + delta + count) % count);
  }, [count]);

  const previous = () => step(-1);
  const next = () => step(1);

  useEffect(() => {
    if (!autoplay) return undefined;
    const timer = setInterval(() => step(1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay, step, index]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
  };

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-navy-900/5 ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={onKeyDown}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resume();
      }}
      onTouchStart={(event) => {
        pause();
        touchStart.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        resume();
        if (touchStart.current == null || count <= 1) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        if (Math.abs(delta) < 40) return;
        if (delta > 0) previous();
        else next();
        touchStart.current = null;
      }}
    >
      <span id={labelId} className="sr-only">{alt || venue?.name || 'Venue photos'}</span>
      <AnimatePresence mode="sync" custom={direction} initial={false}>
        <motion.div
          key={current || 'empty'}
          custom={direction}
          variants={reduced ? reducedHero : heroSlide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduced ? 0.15 : 0.28 }}
          className="absolute inset-0"
        >
          <VenueImage
            src={current}
            alt={alt || venue?.name || ''}
            className={`block h-full w-full object-cover${/\bopacity-\S+/.test(imageClassName) ? ` ${imageClassName.match(/\bopacity-\S+/g).join(' ')}` : ''}`}
            sportName={sportName}
            eager
          />
        </motion.div>
      </AnimatePresence>
      {/* Keep frame height when parent does not stretch (owner cards use h-44 etc.) */}
      <div className={`${imageClassName} pointer-events-none opacity-0`} aria-hidden="true" />

      {showLogo && <LogoBadge venue={venue} owner={owner} />}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation();
              previous();
            }}
            className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-navy-900/55 text-white backdrop-blur transition hover:bg-navy-900/75"
          >
            <ChevronLeft sx={{ fontSize: 18 }} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-navy-900/55 text-white backdrop-blur transition hover:bg-navy-900/75"
          >
            <ChevronRight sx={{ fontSize: 18 }} />
          </button>
          <div className="absolute bottom-3 right-3 z-10 flex gap-1.5" aria-label="Photo position">
            {images.map((url, dotIndex) => (
              <button
                key={`${url}-${dotIndex}`}
                type="button"
                aria-label={`Show photo ${dotIndex + 1}`}
                aria-current={dotIndex === safeIndex}
                onClick={(event) => {
                  event.stopPropagation();
                  go(dotIndex);
                }}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  dotIndex === safeIndex ? 'bg-lime-400' : 'bg-white/55 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
