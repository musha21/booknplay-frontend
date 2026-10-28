import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearInstalledHint,
  isIosSafari,
  isStandaloneDisplay,
  probeRelatedAppsInstalled,
  readBannerDismissed,
  readInstalledHint,
  resolveInstallState,
  setBannerDismissed,
  setInstalledHint,
} from '../utils/pwaInstall';

const PwaInstallContext = createContext(null);

function computeFlags({ hasDeferredPrompt, relatedAppsInstalled }) {
  const standalone = isStandaloneDisplay();
  const iosSafari = isIosSafari();
  const installedHint = readInstalledHint();
  const resolved = resolveInstallState({
    standalone,
    relatedAppsInstalled,
    hasDeferredPrompt,
    installedHint,
    iosSafari,
  });
  if (resolved.shouldClearHint) clearInstalledHint();
  return resolved;
}

export function PwaInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [relatedAppsInstalled, setRelatedAppsInstalled] = useState(false);
  const [bannerDismissed, setBannerDismissedState] = useState(() => readBannerDismissed());
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const [revision, setRevision] = useState(0);

  const flags = useMemo(
    () =>
      computeFlags({
        hasDeferredPrompt: Boolean(deferredPrompt),
        relatedAppsInstalled,
      }),
    [deferredPrompt, relatedAppsInstalled, revision],
  );

  useEffect(() => {
    let cancelled = false;

    const bump = () => setRevision((n) => n + 1);

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      clearInstalledHint();
      setDeferredPrompt(event);
      bump();
    };

    const onAppInstalled = () => {
      setInstalledHint();
      setDeferredPrompt(null);
      setIosSheetOpen(false);
      bump();
    };

    const onDisplayModeChange = () => bump();

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    const mediaQueries = ['standalone', 'fullscreen', 'minimal-ui']
      .map((mode) => {
        try {
          return window.matchMedia(`(display-mode: ${mode})`);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    mediaQueries.forEach((mq) => {
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onDisplayModeChange);
      else if (typeof mq.addListener === 'function') mq.addListener(onDisplayModeChange);
    });

    (async () => {
      const related = await probeRelatedAppsInstalled();
      if (cancelled) return;
      setRelatedAppsInstalled(related);
      bump();
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      mediaQueries.forEach((mq) => {
        if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onDisplayModeChange);
        else if (typeof mq.removeListener === 'function') mq.removeListener(onDisplayModeChange);
      });
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (flags.isIosManual) {
      setIosSheetOpen(true);
      return { outcome: 'ios-manual' };
    }
    if (!deferredPrompt) return { outcome: 'unavailable' };

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice?.outcome === 'accepted') setInstalledHint();
      setRevision((n) => n + 1);
      return { outcome: choice?.outcome || 'dismissed' };
    } catch {
      setDeferredPrompt(null);
      setRevision((n) => n + 1);
      return { outcome: 'error' };
    }
  }, [deferredPrompt, flags.isIosManual]);

  const dismissBanner = useCallback(() => {
    setBannerDismissed();
    setBannerDismissedState(true);
  }, []);

  const closeIosSheet = useCallback(() => setIosSheetOpen(false), []);

  const value = useMemo(
    () => ({
      isInstalled: flags.isInstalled,
      canInstall: flags.canInstall,
      shouldOfferInstall: flags.shouldOfferInstall,
      isIosManual: flags.isIosManual,
      showBanner: flags.shouldOfferInstall && !bannerDismissed,
      iosSheetOpen,
      promptInstall,
      dismissBanner,
      closeIosSheet,
    }),
    [flags, bannerDismissed, iosSheetOpen, promptInstall, dismissBanner, closeIosSheet],
  );

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export default function usePwaInstall() {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    return {
      isInstalled: false,
      canInstall: false,
      shouldOfferInstall: false,
      isIosManual: false,
      showBanner: false,
      iosSheetOpen: false,
      promptInstall: async () => ({ outcome: 'unavailable' }),
      dismissBanner: () => {},
      closeIosSheet: () => {},
    };
  }
  return ctx;
}
