import { beforeEach, describe, expect, it } from 'vitest';
import {
  SPLASH_SEEN_KEY,
  hasSeenSplash,
  markSplashSeen,
  shouldShowSplash,
} from './splash';

describe('splash gate', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows on public first visit', () => {
    expect(shouldShowSplash('/')).toBe(true);
    expect(shouldShowSplash('/venues')).toBe(true);
  });

  it('skips owner and admin portals', () => {
    expect(shouldShowSplash('/owner/login')).toBe(false);
    expect(shouldShowSplash('/admin')).toBe(false);
  });

  it('skips after markSplashSeen', () => {
    markSplashSeen();
    expect(hasSeenSplash()).toBe(true);
    expect(window.localStorage.getItem(SPLASH_SEEN_KEY)).toBe('1');
    expect(shouldShowSplash('/')).toBe(false);
  });
});
