export const PWA_INSTALLED_HINT_KEY = 'booknplay.pwa.installedHint';
export const PWA_BANNER_DISMISS_KEY = 'booknplay.pwa.bannerDismissed';

export function readInstalledHint(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    return storage?.getItem(PWA_INSTALLED_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setInstalledHint(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    storage?.setItem(PWA_INSTALLED_HINT_KEY, '1');
  } catch {
    /* private mode / quota */
  }
}

export function clearInstalledHint(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    storage?.removeItem(PWA_INSTALLED_HINT_KEY);
  } catch {
    /* ignore */
  }
}

export function readBannerDismissed(storage = typeof window !== 'undefined' ? window.sessionStorage : null) {
  try {
    return storage?.getItem(PWA_BANNER_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function setBannerDismissed(storage = typeof window !== 'undefined' ? window.sessionStorage : null) {
  try {
    storage?.setItem(PWA_BANNER_DISMISS_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** True when the app is running in an installed display mode. */
export function isStandaloneDisplay(win = typeof window !== 'undefined' ? window : null) {
  if (!win) return false;
  try {
    if (win.navigator?.standalone === true) return true;
  } catch {
    /* ignore */
  }
  try {
    const modes = ['standalone', 'fullscreen', 'minimal-ui'];
    return modes.some((mode) => win.matchMedia?.(`(display-mode: ${mode})`)?.matches);
  } catch {
    return false;
  }
}

/** Rough iOS Safari detection (no beforeinstallprompt). */
export function isIosSafari(win = typeof window !== 'undefined' ? window : null) {
  if (!win?.navigator) return false;
  const ua = win.navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (win.navigator.platform === 'MacIntel' && win.navigator.maxTouchPoints > 1);
  if (!isIOS) return false;
  // Exclude Chromium/Firefox iOS shells that may support BIP later
  const isCriOS = /CriOS/.test(ua);
  const isFxiOS = /FxiOS/.test(ua);
  const isEdgiOS = /EdgiOS/.test(ua);
  return !isCriOS && !isFxiOS && !isEdgiOS;
}

/**
 * Soft hint alone never forces "installed" when live signals contradict it.
 * - standalone / relatedApps ⇒ installed
 * - deferred BIP available ⇒ not installed (clear hint)
 * - hint only used when no BIP and not iOS-manual offer path contradiction
 */
export function resolveInstallState({
  standalone = false,
  relatedAppsInstalled = false,
  hasDeferredPrompt = false,
  installedHint = false,
  iosSafari = false,
} = {}) {
  if (standalone || relatedAppsInstalled) {
    return {
      isInstalled: true,
      canInstall: false,
      isIosManual: false,
      shouldOfferInstall: false,
      shouldClearHint: false,
    };
  }

  if (hasDeferredPrompt) {
    return {
      isInstalled: false,
      canInstall: true,
      isIosManual: false,
      shouldOfferInstall: true,
      shouldClearHint: installedHint,
    };
  }

  if (iosSafari) {
    return {
      isInstalled: false,
      canInstall: false,
      isIosManual: true,
      shouldOfferInstall: true,
      shouldClearHint: installedHint,
    };
  }

  // Soft hint: hide promotions only when browser gives no install path
  if (installedHint) {
    return {
      isInstalled: true,
      canInstall: false,
      isIosManual: false,
      shouldOfferInstall: false,
      shouldClearHint: false,
    };
  }

  return {
    isInstalled: false,
    canInstall: false,
    isIosManual: false,
    shouldOfferInstall: false,
    shouldClearHint: false,
  };
}

export async function probeRelatedAppsInstalled(nav = typeof navigator !== 'undefined' ? navigator : null) {
  if (!nav || typeof nav.getInstalledRelatedApps !== 'function') return false;
  try {
    const apps = await nav.getInstalledRelatedApps();
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return false;
  }
}
