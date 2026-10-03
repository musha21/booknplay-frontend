import { Dialog, DialogActions, DialogContent, DialogTitle, Skeleton } from '@mui/material';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { dialogPop, fadeUp, pageEnter, reducedFade, sectionEnter, staggerContainer } from '../../motion/variants';

export function OwnerPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col items-start gap-5">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-balance pl-[0.04em] text-3xl font-black leading-tight tracking-[-0.02em] text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-pretty text-sm leading-6 text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function OwnerPage({ children, className = '' }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`mx-auto max-w-7xl pb-8 ${className}`}
      variants={reduced ? reducedFade : pageEnter}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function OwnerSection({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      className={className}
      variants={reduced ? reducedFade : sectionEnter}
      initial="hidden"
      animate="show"
      transition={reduced ? undefined : { delay }}
    >
      {children}
    </motion.section>
  );
}

export function OwnerStagger({ children, className = '', stagger = 0.06 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduced ? undefined : staggerContainer(stagger)}
      initial={reduced ? undefined : 'hidden'}
      animate={reduced ? undefined : 'show'}
    >
      {children}
    </motion.div>
  );
}

export function OwnerMetricCard({ icon: Icon, label, value, detail, tone = 'navy' }) {
  const tones = {
    navy: 'bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-navy-100',
    lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  };

  return (
    <motion.article
      variants={fadeUp}
      className="surface-card flex min-h-32 flex-col justify-between p-4 sm:p-5"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{label}</p>
        {Icon && <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone] || tones.navy}`}><Icon fontSize="small" /></span>}
      </div>
      <div className="mt-4">
        <strong className="block text-2xl font-black tracking-[-0.03em] text-ink">{value}</strong>
        {detail && <span className="mt-1 block text-xs text-muted">{detail}</span>}
      </div>
    </motion.article>
  );
}

function StatFigure({ item, large, reservePrefix }) {
  return (
    <motion.li className="min-w-0" variants={fadeUp}>
      {large && reservePrefix ? (
        <p className={`text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted ${item.prefix ? '' : 'invisible'}`} aria-hidden={item.prefix ? undefined : true}>
          {item.prefix || 'LKR'}
        </p>
      ) : null}
      <p
        className={`font-black leading-none tracking-[-0.03em] text-ink ${large ? 'text-4xl sm:text-5xl' : 'text-3xl'} ${item.prefix ? 'mt-2' : ''}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {item.value}
      </p>
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{item.label}</p>
      {item.detail && <p className="mt-1 max-w-xs text-sm leading-5 text-muted">{item.detail}</p>}
    </motion.li>
  );
}

export function OwnerStatRow({ items }) {
  const lead = items.filter((item) => item.emphasis);
  const rest = items.filter((item) => !item.emphasis);
  const reservePrefix = lead.some((item) => item.prefix);
  const reduced = useReducedMotion();

  return (
    <motion.div variants={reduced ? undefined : staggerContainer(0.05)} initial={reduced ? undefined : 'hidden'} animate={reduced ? undefined : 'show'}>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {lead.map((item) => <StatFigure key={item.label} item={item} large reservePrefix={reservePrefix} />)}
      </ul>
      {rest.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3">
          {rest.map((item) => <StatFigure key={item.label} item={item} />)}
        </ul>
      )}
    </motion.div>
  );
}

export function OwnerSectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h2 className="text-xl font-black tracking-[-0.02em] text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function OwnerStatusBadge({ status, tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-canvas text-muted border-line',
    live: 'bg-lime-100 text-navy-900 border-lime-300 dark:bg-lime-900/30 dark:text-lime-200 dark:border-lime-800',
    warn: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
    danger: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800',
    info: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800',
  };
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] ${tones[tone] || tones.neutral}`}>
      {children || status}
    </span>
  );
}

export function OwnerEmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-navy-100">
          <Icon />
        </span>
      )}
      <h3 className="text-lg font-black text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function OwnerCardSkeleton({ height = 280 }) {
  return <Skeleton variant="rounded" height={height} className="!rounded-[20px]" />;
}

export function OwnerDialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  fullScreenMobile = false,
  maxWidth = 'sm',
}) {
  const reduced = useReducedMotion();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      fullScreen={fullScreenMobile ? undefined : false}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: { xs: fullScreenMobile ? 0 : 4, sm: 4 },
          m: { xs: fullScreenMobile ? 0 : 2, sm: 3 },
          width: { xs: fullScreenMobile ? '100%' : 'calc(100% - 32px)', sm: undefined },
          maxHeight: { xs: fullScreenMobile ? '100%' : 'calc(100% - 32px)', sm: 'calc(100% - 64px)' },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
        ...(fullScreenMobile ? {
          '& .MuiDialog-container': {
            alignItems: { xs: 'stretch', sm: 'center' },
          },
        } : {}),
      }}
      slotProps={{
        paper: {
          component: motion.div,
          variants: reduced ? reducedFade : dialogPop,
          initial: 'hidden',
          animate: 'show',
          exit: 'exit',
        },
      }}
    >
      <DialogTitle className="!pb-1 !pt-5 !text-xl !font-black !tracking-[-0.02em] !text-ink">{title}</DialogTitle>
      {description && (
        <p className="px-6 text-sm leading-6 text-muted">{description}</p>
      )}
      <DialogContent className="!pt-4">{children}</DialogContent>
      {actions && (
        <DialogActions className="!flex-col-reverse !items-stretch !gap-2 !px-6 !pb-5 !pt-2 sm:!flex-row sm:!justify-end">
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

export function OwnerConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  danger = false,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <OwnerDialog
          open={open}
          onClose={loading ? undefined : onClose}
          title={title}
          description={description}
          actions={(
            <>
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="btn-outline min-h-11 w-full sm:w-auto"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-bold sm:w-auto ${
                  danger
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-lime-400 text-navy-900 hover:bg-lime-300'
                }`}
              >
                {loading ? 'Working…' : confirmLabel}
              </button>
            </>
          )}
        />
      ) : null}
    </AnimatePresence>
  );
}

export function OwnerTabBar({ tabs, value, onChange }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative flex gap-1 rounded-2xl border border-line bg-canvas/70 p-1" role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`relative z-10 min-h-11 flex-1 rounded-xl px-3 text-sm font-extrabold transition ${
              active ? 'text-navy-900' : 'text-muted hover:text-ink'
            }`}
          >
            {active && (
              <motion.span
                layoutId={reduced ? undefined : 'owner-tab-indicator'}
                className="absolute inset-0 rounded-xl bg-lime-400"
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
