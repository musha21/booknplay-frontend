import { describe, expect, it } from 'vitest';
import { sportIconSrc } from './sportIcons';

const assetHint = (value) => {
  if (typeof value !== 'string') return '';
  if (value.includes('cricket')) return 'cricket';
  if (value.includes('badminton')) return 'badminton';
  if (value.includes('soccer')) return 'soccer';
  if (value.includes('basketball')) return 'basketball';
  if (value.includes('volleyball')) return 'volleyball';
  if (value.includes('padel')) return 'padel';
  if (value.includes('tennis')) return 'tennis';
  if (value.includes('pool')) return 'pool';
  if (value.includes('swim')) return 'swim';
  if (value.includes('all') || value.includes('Sports--')) return 'all';
  return value.slice(0, 32);
};

describe('sportIconSrc', () => {
  it('maps each main sport to a distinct pictogram where available', () => {
    const cricket = sportIconSrc('Indoor Cricket');
    const badminton = sportIconSrc('Badminton');
    const futsal = sportIconSrc('Futsal');
    const basket = sportIconSrc('Basketball');
    const volley = sportIconSrc('Volleyball');
    const tableTennis = sportIconSrc('Table tennis');
    const squash = sportIconSrc('Squash');
    const padel = sportIconSrc('Padel');
    const pool = sportIconSrc('8-Ball Pool');
    const swim = sportIconSrc('Swimming');
    const all = sportIconSrc('', { all: true });

    expect(cricket).toBeTruthy();
    expect(badminton).not.toBe(padel);
    expect(badminton).not.toBe(tableTennis);
    expect(tableTennis).toBe(squash);
    expect(futsal).not.toBe(basket);
    expect(volley).not.toBe(cricket);
    expect(pool).not.toBe(swim);
    expect(all).not.toBe(cricket);

    // When Vite keeps filenames in the URL, assert the expected mapping.
    const hints = [cricket, badminton, futsal, basket, volley, padel, pool, swim].map(assetHint);
    if (hints.every((hint) => !hint.startsWith('data:') && hint.length < 40)) {
      expect(assetHint(cricket)).toBe('cricket');
      expect(assetHint(badminton)).toBe('badminton');
      expect(assetHint(futsal)).toBe('soccer');
      expect(assetHint(basket)).toBe('basketball');
      expect(assetHint(volley)).toBe('volleyball');
      expect(assetHint(padel)).toBe('padel');
      expect(assetHint(tableTennis)).toBe('tennis');
      expect(assetHint(pool)).toBe('pool');
      expect(assetHint(swim)).toBe('swim');
    }
  });
});
