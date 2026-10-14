import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollWindowTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function scrollToVenuesInstant() {
  const target = document.getElementById('venues');
  if (!target) return false;
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
  return true;
}

/**
 * Keeps customer route changes from flashing mid-page or smooth-scrolling
 * from the top after paint. Pathname resets to top; #venues jumps instantly.
 */
export default function CustomerScrollManager() {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    if (hash === '#venues') {
      if (scrollToVenuesInstant()) return undefined;
      const frame = window.requestAnimationFrame(() => {
        if (!scrollToVenuesInstant()) scrollWindowTop();
      });
      return () => window.cancelAnimationFrame(frame);
    }
    scrollWindowTop();
    return undefined;
  }, [pathname, hash, key]);

  return null;
}
