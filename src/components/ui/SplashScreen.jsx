import { useEffect, useRef, useState } from 'react';
import './SplashScreen.css';

/** Mount once at the application root. Pass a stable logoSrc. */
export default function SplashScreen({
  logoSrc = `${import.meta.env.BASE_URL}booknplay-logo.png`,
  onComplete,
}) {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const callback = useRef(onComplete);
  useEffect(() => { callback.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let active = true;
    const logo = new Image();
    const proceed = () => { if (active) setReady(true); };
    logo.onload = proceed;
    logo.onerror = proceed;
    logo.src = logoSrc;
    // A slow or missing image must never trap the visitor behind the splash.
    const fallback = window.setTimeout(proceed, 500);
    return () => { active = false; clearTimeout(fallback); logo.onload = null; logo.onerror = null; };
  }, [logoSrc]);

  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      setVisible(false);
      callback.current?.();
    }, reduced ? 300 : 2500);
    return () => window.clearTimeout(timer);
  }, [ready]);

  if (!visible) return null;
  // Decorative overlay: the app underneath can load immediately.
  return (
    <div className="bnp-splash" aria-hidden="true"
      style={!ready ? { animation: 'none' } : undefined}>
      {ready && <div className="bnp-splash__content">
        <div className="bnp-splash__stage">
          <div className="bnp-splash__ripple" />
          <div className="bnp-splash__ball" />
          <div className="bnp-splash__ring" />
          <img className="bnp-splash__logo" src={logoSrc} alt="" width="180" height="180" />
        </div>
        <p className="bnp-splash__name">Bookn<span>Play</span></p>
      </div>}
    </div>
  );
}
