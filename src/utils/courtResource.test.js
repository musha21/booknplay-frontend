import { describe, expect, it } from 'vitest';
import {
  buildResourceNames,
  pluralizeResourceLabel,
  resourceLabelForCourt,
  resourceLabelForSport,
} from './courtResource';

describe('court resource labels', () => {
  it.each([
    ['Futsal / Indoor Football', 'Pitch'],
    ['Table Tennis', 'Table'],
    ['8-Ball Pool', 'Pool Table'],
    ['Swimming', 'Lane'],
    ['Indoor Cricket', 'Court'],
    ['Custom sport', 'Court'],
  ])('maps %s to %s', (sport, resource) => {
    expect(resourceLabelForSport(sport)).toBe(resource);
  });

  it('prefers a courtType supplied by a future backend contract', () => {
    expect(resourceLabelForCourt({
      courtType: 'Field',
      sportName: 'Futsal / Indoor Football',
    })).toBe('Field');
  });

  it('falls back to the sport when courtType is unavailable', () => {
    expect(resourceLabelForCourt({ sportName: 'Swimming' })).toBe('Lane');
  });

  it('pluralizes display words and builds onboarding names', () => {
    expect(pluralizeResourceLabel('Pitch', 2)).toBe('Pitches');
    expect(pluralizeResourceLabel('Pool Table', 2)).toBe('Pool Tables');
    expect(pluralizeResourceLabel('Lane', 1)).toBe('Lane');
    expect(buildResourceNames('Lane', 3)).toEqual(['Lane A', 'Lane B', 'Lane C']);
  });
});
