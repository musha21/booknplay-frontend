import { describe, expect, it } from 'vitest';
import { paletteForMode, PALETTE_DARK, PALETTE_LIGHT } from './morphTiming';

function approxRgb(actual, hex) {
  const h = hex.replace('#', '');
  const expected = [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
  expect(actual[0]).toBeCloseTo(expected[0], 5);
  expect(actual[1]).toBeCloseTo(expected[1], 5);
  expect(actual[2]).toBeCloseTo(expected[2], 5);
}

describe('paletteForMode', () => {
  it('returns light palette by default', () => {
    expect(paletteForMode()).toBe(PALETTE_LIGHT);
    expect(paletteForMode('light')).toBe(PALETTE_LIGHT);
  });

  it('returns dark palette for dark mode', () => {
    expect(paletteForMode('dark')).toBe(PALETTE_DARK);
  });

  it('keeps nine brand slots in both modes', () => {
    expect(PALETTE_LIGHT).toHaveLength(9);
    expect(PALETTE_DARK).toHaveLength(9);
    expect(PALETTE_LIGHT[0]).not.toEqual(PALETTE_DARK[0]);
  });

  it('uses punched brand lime accents in dark mode', () => {
    approxRgb(PALETTE_DARK[1], '#d4ff5a');
    approxRgb(PALETTE_DARK[2], '#c7f84b');
    approxRgb(PALETTE_DARK[3], '#245a70');
    approxRgb(PALETTE_DARK[7], '#f0ff70');
  });

  it('keeps dark body fill bright enough for dark surfaces', () => {
    const [r, g, b] = PALETTE_DARK[0];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    expect(luminance).toBeGreaterThan(0.55);
  });
});
