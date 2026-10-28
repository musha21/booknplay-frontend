import { Download, Share2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import usePwaInstall from '../../hooks/usePwaInstall';

export default function PwaInstallBanner({ liftForTabs = false }) {
  const {
    showBanner,
    shouldOfferInstall,
    isIosManual,
    iosSheetOpen,
    promptInstall,
    dismissBanner,
    closeIosSheet,
  } = usePwaInstall();

  if (!shouldOfferInstall && !iosSheetOpen) return null;

  const bottomPad = liftForTabs
    ? 'pb-[calc(4.75rem+env(safe-area-inset-bottom))]'
    : 'pb-[max(0.75rem,env(safe-area-inset-bottom))]';

  return (
    <>
      {showBanner && (
        <div
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-center p-3 ${bottomPad}`}
          role="region"
          aria-label="Install Booknplay"
        >
          <div className="pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-3 shadow-[0_12px_32px_rgba(9,38,54,0.12)] sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-navy-900">
              <Download size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">Install Booknplay</p>
              <p className="text-xs text-muted">
                {isIosManual
                  ? 'Add to your Home Screen for quicker bookings.'
                  : 'Get faster access and a fuller-screen experience.'}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-lime-400 px-3 py-2 text-xs font-extrabold text-navy-900"
              onClick={() => promptInstall()}
            >
              {isIosManual ? 'How to' : 'Install'}
            </button>
            <IconButton
              aria-label="Dismiss install banner"
              onClick={dismissBanner}
              size="small"
              className="!text-muted"
            >
              <X size={18} />
            </IconButton>
          </div>
        </div>
      )}

      <Dialog open={iosSheetOpen} onClose={closeIosSheet} fullWidth maxWidth="xs">
        <DialogTitle className="!flex !items-center !justify-between !pr-2 !font-extrabold !text-ink">
          Add to Home Screen
          <IconButton aria-label="Close" onClick={closeIosSheet} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!pt-0">
          <ol className="space-y-3 pb-2 text-sm text-muted">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400 text-xs font-black text-navy-900">1</span>
              <span>
                Tap the <Share2 className="inline align-text-bottom" size={16} aria-label="Share" /> Share button in Safari.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400 text-xs font-black text-navy-900">2</span>
              <span>Scroll and choose <strong className="text-ink">Add to Home Screen</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400 text-xs font-black text-navy-900">3</span>
              <span>Confirm <strong className="text-ink">Add</strong>. Open Booknplay from your Home Screen next time.</span>
            </li>
          </ol>
          <button
            type="button"
            className="mt-2 w-full rounded-xl bg-lime-400 py-2.5 text-sm font-extrabold text-navy-900"
            onClick={closeIosSheet}
          >
            Got it
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
