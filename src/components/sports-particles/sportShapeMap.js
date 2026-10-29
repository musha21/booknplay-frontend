import { ALL_SHAPE_KEYS, SHAPE_LABELS } from './morphTiming';

/** Infer a particle shape key from a sport display name. */
export function inferShapeFromSportName(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('cricket')) return 'cricket';
  if (n.includes('badminton')) return 'badminton';
  if (n.includes('basket')) return 'basketball';
  if (n.includes('pool') && !n.includes('swim')) return 'pool';
  if (n.includes('swim')) return 'swimming';
  if (n.includes('futsal') || n.includes('football') || n.includes('soccer')) return 'football';
  if (n.includes('padel') || n.includes('pickle') || n.includes('squash') || n.includes('tennis')) return 'tennis';
  if (n.includes('volley')) return 'football';
  return 'football';
}

/**
 * Resolve shape for a selected sport.
 * Admin map wins; otherwise name heuristic.
 */
export function resolveSportShape({
  sportId,
  sportName = '',
  sportParticleShapes = {},
} = {}) {
  if (sportId != null && sportParticleShapes) {
    const mappedRaw =
      sportParticleShapes[sportId]
      ?? sportParticleShapes[String(sportId)];
    if (mappedRaw) {
      const mapped = String(mappedRaw).toLowerCase();
      if (ALL_SHAPE_KEYS.includes(mapped)) return mapped;
    }
  }
  return inferShapeFromSportName(sportName);
}

export const PARTICLE_SHAPE_OPTIONS = ALL_SHAPE_KEYS.map((key) => ({
  value: key,
  label: SHAPE_LABELS[key] || key,
}));
