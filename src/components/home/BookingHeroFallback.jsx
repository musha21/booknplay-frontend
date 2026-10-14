import HomeHero from './HomeHero';

export default function BookingHeroFallback({ homepage = {}, cover, onSearch, filterProps }) {
  return <HomeHero homepage={homepage} image={cover} onExplore={onSearch} filterProps={filterProps} />;
}

