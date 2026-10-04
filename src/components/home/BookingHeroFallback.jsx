import HomeHero from './HomeHero';

export default function BookingHeroFallback({ homepage = {}, cover, onSearch, searchFilters, onSearchSubmit }) {
  return <HomeHero homepage={homepage} image={cover} onExplore={onSearch} searchFilters={searchFilters} onSearchSubmit={onSearchSubmit} />;
}
