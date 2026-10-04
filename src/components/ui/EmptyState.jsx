import { Button } from '@mui/material';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="customer-panel flex min-h-64 flex-col items-center justify-center border-dashed bg-canvas/60 px-6 py-10 text-center shadow-none">
      {Icon && <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-lime-700"><Icon className="!text-3xl" /></span>}
      <h2 className="customer-card-title">{title}</h2>
      <p className="customer-body mt-2 max-w-md !text-sm">{description}</p>
      {actionLabel && <Button variant="contained" color="secondary" onClick={onAction} className="!mt-5">{actionLabel}</Button>}
    </div>
  );
}

