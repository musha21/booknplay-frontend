import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import SportsParticleFallback from './SportsParticleFallback';
import { resolveSportShape } from './sportShapeMap';
import { useThemeMode } from '../../theme/ThemeModeContext';

const SportsParticleCanvas = lazy(() => import('./SportsParticleCanvas'));

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/**
 * Decorative sports particle morph.
 * When a sport is selected, holds that sport's mapped shape; otherwise loops.
 */
export default function SportsParticleMorph({
  selectedSportId = '',
  selectedSportName = '',
  sportParticleShapes = {},
}) {
  const reduced = useReducedMotion();
  const { resolvedMode } = useThemeMode();
  const hostRef = useRef(null);
  const [webglOk] = useState(() => (typeof document === 'undefined' ? true : canUseWebGL()));
  const [visible, setVisible] = useState(true);
  const [tabHidden, setTabHidden] = useState(typeof document !== 'undefined' ? document.hidden : false);

  const lockedShapeKey = useMemo(() => {
    if (!selectedSportId) return null;
    return resolveSportShape({
      sportId: selectedSportId,
      sportName: selectedSportName,
      sportParticleShapes,
    });
  }, [selectedSportId, selectedSportName, sportParticleShapes]);

  const allowCanvas = !reduced && webglOk;
  const paused = !visible || tabHidden;

  useEffect(() => {
    const node = hostRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        setVisible(entries[0]?.isIntersecting !== false);
      },
      { rootMargin: '80px', threshold: 0.05 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div className="hp-sport-particle" aria-hidden="true" ref={hostRef}>
      {allowCanvas ? (
        <Suspense fallback={<SportsParticleFallback />}>
          <SportsParticleCanvas
            lockedShapeKey={lockedShapeKey}
            paused={paused}
            themeMode={resolvedMode}
          />
        </Suspense>
      ) : (
        <SportsParticleFallback />
      )}
    </div>
  );
}
