import { CircularProgress } from '@mui/material';
import BrandLogo from './BrandLogo';

export default function RouteLoader() {
  return (
    <div className="page-shell flex min-h-screen flex-col items-center justify-center gap-5" role="status" aria-label="Loading page">
      <BrandLogo linked={false} />
      <CircularProgress size={28} color="secondary" />
    </div>
  );
}
