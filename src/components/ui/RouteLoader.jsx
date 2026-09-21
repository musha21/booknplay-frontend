import { CircularProgress } from '@mui/material';

export default function RouteLoader() {
  return (
    <div className="page-shell flex min-h-screen flex-col items-center justify-center gap-5" role="status" aria-label="Loading page">
      <div className="flex items-center gap-2" aria-label="Booknplay.lk">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-lg font-black text-lime-300">B</span>
        <span className="text-xl font-black tracking-tight text-ink">bookn<span className="text-lime-500">play</span>.lk</span>
      </div>
      <CircularProgress size={28} color="secondary" />
    </div>
  );
}
