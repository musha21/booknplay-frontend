import { ArrowForward, LocationOn } from '@mui/icons-material';
import NavSearchBar from '../layout/NavSearchBar';
import VenueImage from '../ui/VenueImage';

const DEFAULT_HEADING = 'Your next game starts here.';
const DEFAULT_DESCRIPTION = 'Find your court. Bring your people. Make time for the sport you love.';

function HeroHeading({ children }) {
  const text = String(children || DEFAULT_HEADING);
  const highlight = 'starts here.';
  const index = text.toLowerCase().indexOf(highlight);
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
  badge = 'The court is calling.',
  onExplore,
  searchFilters,
  onSearchSubmit,
}) {
  const heading = homepage.heading || DEFAULT_HEADING;
  const description = homepage.description || DEFAULT_DESCRIPTION;

  return (
    <>
      <section className="hp-hero">
        <div className="hp-hero-copy">
          <p className="hp-eyebrow"><span className="hp-tiny-court" aria-hidden="true">+</span> Less planning. More playing.</p>
          <h1><HeroHeading>{heading}</HeroHeading></h1>
          <p>{description}</p>
          <button type="button" className="hp-hero-link" onClick={onExplore}>
            Find your kind of play <span aria-hidden="true">→</span>
          </button>
          <p className="hp-launch-note"><LocationOn fontSize="inherit" /> Starting in Kandy. Built for Sri Lanka.</p>
        </div>
        <div className="hp-hero-photo">
          <VenueImage src={image} alt={imageAlt || 'Sports venue'} />
          <div className="hp-photo-shade" />
          <span className="hp-photo-label">{badge}</span>
          <div className="hp-photo-bottom">
            <span>Less screen time.<br /><b>More game time.</b></span>
            <button type="button" className="hp-round-arrow" aria-label="Find a venue" onClick={onExplore}><ArrowForward /></button>
          </div>
        </div>
        <p className="hp-hero-side">BOOKNPLAY.LK</p>
      </section>
      {homepage.showSearch !== false && (
        <div className="hp-search" id="home-search">
          <NavSearchBar key={`${searchFilters?.sportId || ''}-${searchFilters?.date || ''}-${searchFilters?.time || ''}`} initialFilters={searchFilters} onSubmit={onSearchSubmit} />
        </div>
      )}
    </>
  );
}
