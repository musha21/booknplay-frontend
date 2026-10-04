import banner from '../../assets/brand/mobile-app-banner.png';

export default function MobileAppBanner() {
  return (
    <div className="hp-app-banner" aria-label="Mobile app">
      <img
        src={banner}
        alt="Booknplay mobile app — coming soon on the App Store and Google Play"
        className="hp-app-banner-image"
        width={2172}
        height={724}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
