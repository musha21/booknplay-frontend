import { describe, expect, it } from 'vitest';
import { inferShapeFromSportName, resolveSportShape } from './sportShapeMap';
import { smoothstep, CYCLE_DURATION, HOLD_DURATION, MORPH_DURATION } from './morphTiming';

describe('inferShapeFromSportName', () => {
  it('maps common sport names', () => {
    expect(inferShapeFromSportName('Cricket')).toBe('cricket');
    expect(inferShapeFromSportName('Football 5-a-side')).toBe('football');
    expect(inferShapeFromSportName('Badminton Court')).toBe('badminton');
    expect(inferShapeFromSportName('Basketball')).toBe('basketball');
    expect(inferShapeFromSportName('Tennis')).toBe('tennis');
    expect(inferShapeFromSportName('Pool')).toBe('pool');
    expect(inferShapeFromSportName('Swimming')).toBe('swimming');
    expect(inferShapeFromSportName('Futsal')).toBe('football');
  });
});

describe('resolveSportShape', () => {
  it('prefers admin map over name heuristic', () => {
    expect(
      resolveSportShape({
        sportId: '12',
        sportName: 'Cricket',
        sportParticleShapes: { 12: 'tennis' },
      }),
    ).toBe('tennis');
  });

  it('falls back to name when map missing or invalid', () => {
    expect(
      resolveSportShape({
        sportId: '9',
        sportName: 'Badminton',
        sportParticleShapes: {},
      }),
    ).toBe('badminton');
    expect(
      resolveSportShape({
        sportId: '9',
        sportName: 'Badminton',
        sportParticleShapes: { 9: 'not-a-shape' },
      }),
    ).toBe('badminton');
  });
});

describe('morphTiming', () => {
  it('exposes plan timings', () => {
    expect(HOLD_DURATION).toBe(4);
    expect(MORPH_DURATION).toBe(1.8);
    expect(CYCLE_DURATION).toBe(HOLD_DURATION + MORPH_DURATION);
  });

  it('smoothsteps within 0..1', () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.5)).toBeGreaterThan(0.4);
    expect(smoothstep(0.5)).toBeLessThan(0.6);
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(2)).toBe(1);
  });
});
