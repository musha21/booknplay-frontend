import { motion, useReducedMotion } from 'motion/react';
import NavSearchBar from '../layout/NavSearchBar';
import BrandLogo from '../ui/BrandLogo';
import VenueImage from '../ui/VenueImage';
import { fadeUp, reducedFade, staggerContainer } from '../../motion/variants';

const DEFAULT_HEADING = 'Find. Book. Play.';
const DEFAULT_DESCRIPTION = 'Find your court. Bring your people. Make time for the sport you love.';

function HeroHeading({ children }) {
  const text = String(children || DEFAULT_HEADING);
  const highlight = 'play.';
  const index = text.toLowerCase().lastIndexOf(highlight);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <em>{text.slice(index, index + highlight.length)}</em>
      {text.slice(index + highlight.length)}
    </>
  );
}

export default function HomeHero({
  homepage = {},
  image,
  imageAlt = '',
  onExplore,
  searchFilters,
  onSearchSubmit,
}) {
  const reduced = useReducedMotion();
  const heading = homepage.heading || DEFAULT_HEADING;
  const description = homepage.description || DEFAULT_DESCRIPTION;
  const item = reduced ? reducedFade : fadeUp;
  const mediaTransition = reduced
    ? { duration: 0.2 }
    : { duration: 1.1, ease: [0.22, 1, 0.36, 1] };

  return (
    <section className="hp-hero" aria-label="Booknplay hero">
      <motion.div
        className="hp-hero-media"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={mediaTransition}
      >
        <VenueImage src={image} alt={imageAlt || 'Sports venue'} eager />
      </motion.div>
      <div className="hp-hero-shade" aria-hidden="true" />

      <div className="hp-hero-inner">
        <motion.div
          className="hp-hero-content"
          variants={staggerContainer(reduced ? 0 : 0.1)}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <BrandLogo variant="home" inverse className="hp-hero-brand" />
          </motion.div>
          <motion.h1 variants={item}>
            <HeroHeading>{heading}</HeroHeading>
          </motion.h1>
          <motion.p variants={item}>{description}</motion.p>
          <motion.div variants={item}>
            <button type="button" className="hp-hero-link" onClick={onExplore}>
              Find your kind of play <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </motion.div>

        {homepage.showSearch !== false && (
          <motion.div
            className="hp-hero-search"
            id="home-search"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0.2 } : { delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <NavSearchBar
              key={`${searchFilters?.sportId || ''}-${searchFilters?.date || ''}-${searchFilters?.time || ''}`}
              initialFilters={searchFilters}
              onSubmit={onSearchSubmit}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
