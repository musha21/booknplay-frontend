import { Button } from '@mui/material';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-canvas/60 px-6 py-10 text-center">
      {Icon && <Icon className="!mb-4 !text-5xl !text-slate-300" />}
      <h2 className="text-lg font-extrabold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionLabel && <Button variant="contained" color="secondary" onClick={onAction} className="!mt-5">{actionLabel}</Button>}
    </div>
  );
}

