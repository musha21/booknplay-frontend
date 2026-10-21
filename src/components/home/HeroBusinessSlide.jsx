import HomeHero from './HomeHero';

export default function HeroBusinessSlide({
  slide,
  homepage = {},
  fallbackImage,
  onExplore,
  onSearch,
  filterProps,
}) {
  return (
    <HomeHero
      homepage={{
        ...homepage,
        heading: homepage.heading || slide.headline,
        description: homepage.description || slide.description,
      }}
      image={slide.imageUrl || fallbackImage || undefined}
      imageAlt={slide.name || 'Sports venue'}
      onBook={slide?.businessId && onExplore ? () => onExplore(slide) : onSearch}
      onBrowseSports={() => {
        document.getElementById('sports')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      filterProps={filterProps}
    />
  );
}
