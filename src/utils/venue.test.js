import { describe, expect, it } from 'vitest';
import { sportAccent } from './venue';

describe('sportAccent', () => {
  it('keeps cricket lime and football blue without a field background', () => {
    expect(sportAccent('Indoor Cricket')).toBe('#84cc16');
    expect(sportAccent('Futsal / Indoor Football')).toBe('#3b82f6');
  });
});
