import { lazy, Suspense } from 'react';
import { Skeleton } from '@mui/material';

const Chart = lazy(() => import('react-apexcharts'));

/**
 * Defers the ~900KB react-apexcharts bundle until a chart actually mounts.
 */
export default function LazyApexChart({ height = 280, ...props }) {
  return (
    <Suspense fallback={<Skeleton variant="rounded" height={height} className="!mt-2" />}>
      <Chart height={height} {...props} />
    </Suspense>
  );
}
