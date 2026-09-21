import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, PlayArrow } from '@mui/icons-material';
import HeroBusinessSlide from './HeroBusinessSlide';
import { heroSlide, reducedHero, intensityFactor } from '../../motion/variants';

export default function PremiumBusinessHero({ homepage, slides, onExplore, onSearch }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const many = slides.length > 1;
  const seconds = Math.min(15, Math.max(4, homepage.premiumSliderSeconds || 6));
  const autoplay = homepage.premiumSliderAutoplay !== false && many && !reduced && !paused;
  const pauseOnHover = homepage.premiumSliderPauseOnHover !== false;
  const arrows = homepage.premiumSliderArrows !== false && many;
  const indicators = homepage.premiumSliderIndicators !== false && many;

  const go = useCallback((delta) => {
    setDirection(delta);
    setIndex((current) => (current + delta + slides.length) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (!autoplay) return undefined;
    const timer = setInterval(() => go(1), seconds * 1000);
    return () => clearInterval(timer);
  }, [autoplay, seconds, go, index]);

  const slide = slides[index];
  if (!slide) return null;
  const none = homepage.animationIntensity === 'NONE';
  const variants = reduced || none ? reducedHero : heroSlide;
  const duration = reduced || none ? 0.15 : 0.35 * intensityFactor(homepage.animationIntensity);

  return (
    <section
      className="relative overflow-hidden bg-navy-900"
      aria-roledescription="carousel"
      aria-label="Premium sports businesses"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    >
      <div className="relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id || slide.businessId}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration }}
            drag={many && !reduced ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => { if (info.offset.x < -50) go(1); if (info.offset.x > 50) go(-1); }}
          >
            <HeroBusinessSlide slide={slide} homepage={homepage} onExplore={onExplore} onSearch={onSearch} reduced={reduced} />
          </motion.div>
        </AnimatePresence>
        {arrows && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 justify-between px-3 lg:flex">
            <button type="button" aria-label="Previous premium business" className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy-900/80 text-white" onClick={() => go(-1)}><ChevronLeft /></button>
            <button type="button" aria-label="Next premium business" className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy-900/80 text-white" onClick={() => go(1)}><ChevronRight /></button>
          </div>
        )}
      </div>
      {(indicators || (homepage.premiumSliderAutoplay !== false && many && !reduced)) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="section-container pointer-events-auto flex items-center justify-between gap-4 pb-5">
            {indicators ? (
              <div className="flex gap-2" role="tablist" aria-label="Premium slides">
                {slides.map((item, itemIndex) => (
                  <button key={item.id || item.businessId} type="button" role="tab" aria-selected={itemIndex === index} aria-label={`Show ${item.name}`} className={`h-2.5 rounded-full transition ${itemIndex === index ? 'w-8 bg-lime-400' : 'w-2.5 bg-white/40'}`} onClick={() => { setDirection(itemIndex > index ? 1 : -1); setIndex(itemIndex); }} />
                ))}
              </div>
            ) : <span />}
            {homepage.premiumSliderAutoplay !== false && many && !reduced && (
              <button type="button" className="flex min-h-11 items-center gap-2 text-sm font-bold text-white" onClick={() => setPaused((value) => !value)}>
                {paused ? <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
                {paused ? 'Play slides' : 'Pause slides'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
