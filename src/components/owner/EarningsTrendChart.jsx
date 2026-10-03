import { motion, useReducedMotion } from 'motion/react';
import { normalizeDailyRows } from '../../utils/ownerReports';

/**
 * Dual-series SVG: booking bars + net (or gross) line.
 * @param {{ summary?: object, compact?: boolean, className?: string }} props
 */
export default function EarningsTrendChart({ summary, compact = false, className = '' }) {
  const reduced = useReducedMotion();
  const rows = normalizeDailyRows(summary);
  const height = compact ? 56 : 220;
  const width = compact ? 280 : 720;
  const padX = compact ? 4 : 36;
  const padY = compact ? 6 : 28;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  if (rows.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-dashed border-line bg-canvas/60 text-sm text-muted ${compact ? 'h-14 px-3' : 'h-56'} ${className}`}>
        No daily activity in this range yet.
      </div>
    );
  }

  const maxBookings = Math.max(1, ...rows.map((row) => row.bookingCount));
  const maxNet = Math.max(1, ...rows.map((row) => row.net));
  const slot = plotW / Math.max(rows.length, 1);
  const barW = Math.max(2, Math.min(compact ? 8 : 18, slot * 0.55));

  const points = rows.map((row, index) => {
    const x = padX + slot * index + slot / 2;
    const barH = (row.bookingCount / maxBookings) * plotH;
    const yBar = padY + plotH - barH;
    const yNet = padY + plotH - (row.net / maxNet) * plotH;
    return { ...row, x, yBar, barH, yNet };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.yNet.toFixed(1)}`)
    .join(' ');

  const labelEvery = rows.length > 14 ? 4 : rows.length > 8 ? 2 : 1;

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minWidth: compact ? undefined : 480, height: compact ? height : undefined }}
        role="img"
        aria-label="Daily bookings and net earnings trend"
      >
        {!compact && (
          <>
            <line x1={padX} y1={padY} x2={padX} y2={height - padY} stroke="var(--line)" strokeWidth="1" />
            <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="var(--line)" strokeWidth="1" />
          </>
        )}

        {points.map((point) => (
          <motion.rect
            key={`bar-${point.date}`}
            x={point.x - barW / 2}
            width={barW}
            rx={compact ? 1 : 3}
            className="fill-navy-700/70 dark:fill-lime-400/50"
            initial={reduced ? false : { y: padY + plotH, height: 0 }}
            animate={{ y: point.yBar, height: point.barH }}
            transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        <motion.path
          d={linePath}
          fill="none"
          className="stroke-lime-600 dark:stroke-lime-400"
          strokeWidth={compact ? 1.5 : 2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />

        {!compact && points.map((point, index) => (
          index % labelEvery === 0 ? (
            <text
              key={`label-${point.date}`}
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted text-[10px]"
            >
              {point.date.slice(5)}
            </text>
          ) : null
        ))}
      </svg>
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-navy-700/70 dark:bg-lime-400/50" /> Bookings
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 rounded bg-lime-600 dark:bg-lime-400" /> Net earnings
          </span>
        </div>
      )}
    </div>
  );
}
