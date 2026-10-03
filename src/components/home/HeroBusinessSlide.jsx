import HomeHero from './HomeHero';

export default function HeroBusinessSlide({ slide, homepage = {}, fallbackImage, onExplore, onSearch, searchFilters, onSearchSubmit }) {
  return (
    <HomeHero
      homepage={{
        ...homepage,
        heading: homepage.heading || slide.headline,
        description: homepage.description || slide.description,
      }}
      image={slide.imageUrl || fallbackImage}
      imageAlt={slide.name || 'Sports venue'}
      badge={slide.badge || (slide.name ? `${slide.name} is calling.` : undefined)}
      onExplore={slide?.businessId && onExplore ? () => onExplore(slide) : onSearch}
      searchFilters={searchFilters}
      onSearchSubmit={onSearchSubmit}
    />
  );
}
