import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  PWA_INSTALLED_HINT_KEY,
  clearInstalledHint,
  isIosSafari,
  isStandaloneDisplay,
  readInstalledHint,
  resolveInstallState,
  setInstalledHint,
} from './pwaInstall';

describe('resolveInstallState', () => {
  it('hides offers when standalone', () => {
    expect(
      resolveInstallState({
        standalone: true,
        hasDeferredPrompt: true,
        iosSafari: true,
        installedHint: false,
      }),
    ).toMatchObject({
      isInstalled: true,
      shouldOfferInstall: false,
      canInstall: false,
    });
  });

  it('hides offers when related apps are installed', () => {
    expect(
      resolveInstallState({
        relatedAppsInstalled: true,
        hasDeferredPrompt: true,
      }),
    ).toMatchObject({
      isInstalled: true,
      shouldOfferInstall: false,
    });
  });

  it('offers native install when beforeinstallprompt is deferred', () => {
    expect(
      resolveInstallState({
        hasDeferredPrompt: true,
        installedHint: true,
      }),
    ).toMatchObject({
      isInstalled: false,
      canInstall: true,
      shouldOfferInstall: true,
      shouldClearHint: true,
    });
  });

  it('offers iOS manual path when Safari is not standalone', () => {
    expect(
      resolveInstallState({
        iosSafari: true,
        installedHint: true,
      }),
    ).toMatchObject({
      isInstalled: false,
      isIosManual: true,
      shouldOfferInstall: true,
      shouldClearHint: true,
    });
  });

  it('uses soft hint only when no live install path exists', () => {
    expect(
      resolveInstallState({
        installedHint: true,
      }),
    ).toMatchObject({
      isInstalled: true,
      shouldOfferInstall: false,
      shouldClearHint: false,
    });
  });

  it('does not offer when browser cannot install and no hint', () => {
    expect(resolveInstallState({})).toMatchObject({
      isInstalled: false,
      shouldOfferInstall: false,
      canInstall: false,
    });
  });
});

describe('installed hint storage', () => {
  let store;

  beforeEach(() => {
    store = {
      data: {},
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
      },
      setItem(key, value) {
        this.data[key] = String(value);
      },
      removeItem(key) {
        delete this.data[key];
      },
    };
  });

  it('sets and clears the soft installed hint', () => {
    setInstalledHint(store);
    expect(readInstalledHint(store)).toBe(true);
    expect(store.data[PWA_INSTALLED_HINT_KEY]).toBe('1');
    clearInstalledHint(store);
    expect(readInstalledHint(store)).toBe(false);
  });
});

describe('isStandaloneDisplay', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects iOS navigator.standalone', () => {
    const win = {
      navigator: { standalone: true },
      matchMedia: () => ({ matches: false }),
    };
    expect(isStandaloneDisplay(win)).toBe(true);
  });

  it('detects display-mode standalone', () => {
    const win = {
      navigator: {},
      matchMedia: (query) => ({ matches: query.includes('standalone') }),
    };
    expect(isStandaloneDisplay(win)).toBe(true);
  });
});

describe('isIosSafari', () => {
  it('detects iPhone Safari', () => {
    expect(
      isIosSafari({
        navigator: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          platform: 'iPhone',
          maxTouchPoints: 5,
        },
      }),
    ).toBe(true);
  });

  it('excludes Chrome on iOS', () => {
    expect(
      isIosSafari({
        navigator: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
          platform: 'iPhone',
          maxTouchPoints: 5,
        },
      }),
    ).toBe(false);
  });
});
