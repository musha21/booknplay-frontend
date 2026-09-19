export function OwnerPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
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
    <article className="surface-card flex min-h-32 flex-col justify-between p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{label}</p>
        {Icon && <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone] || tones.navy}`}><Icon fontSize="small" /></span>}
      </div>
      <div className="mt-4">
        <strong className="block text-2xl font-black tracking-[-0.03em] text-ink">{value}</strong>
        {detail && <span className="mt-1 block text-xs text-muted">{detail}</span>}
      </div>
    </article>
  );
}

export function OwnerSectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-xl font-black tracking-[-0.02em] text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
