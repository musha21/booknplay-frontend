import dayjs from 'dayjs';

export const REPORT_RANGE_PRESETS = {
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  THIS_MONTH: 'THIS_MONTH',
};

export const REPORT_RANGE_OPTIONS = [
  { id: REPORT_RANGE_PRESETS.LAST_7_DAYS, label: 'Last 7 days' },
  { id: REPORT_RANGE_PRESETS.LAST_30_DAYS, label: 'Last 30 days' },
  { id: REPORT_RANGE_PRESETS.THIS_MONTH, label: 'This month' },
];

/** @returns {{ from: string, to: string }} YYYY-MM-DD */
export function reportRangeDates(preset, now = dayjs()) {
  const to = now.format('YYYY-MM-DD');
  if (preset === REPORT_RANGE_PRESETS.LAST_7_DAYS) {
    return { from: now.subtract(6, 'day').format('YYYY-MM-DD'), to };
  }
  if (preset === REPORT_RANGE_PRESETS.THIS_MONTH) {
    return { from: now.startOf('month').format('YYYY-MM-DD'), to };
  }
  return { from: now.subtract(29, 'day').format('YYYY-MM-DD'), to };
}

export function normalizeDailyRows(summary) {
  const rows = Array.isArray(summary?.daily) ? summary.daily : [];
  return rows.map((row) => ({
    date: String(row.date || ''),
    bookingCount: Number(row.bookingCount ?? 0),
    gross: Number(row.gross ?? 0),
    commission: Number(row.commission ?? 0),
    net: Number(row.net ?? row.gross ?? 0),
  })).filter((row) => row.date);
}

export function buildEarningsCsv(rows) {
  const header = ['Date', 'Bookings', 'Gross', 'Commission', 'Net'];
  const escape = (value) => {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
    return text;
  };
  const lines = [
    header.join(','),
    ...rows.map((row) => [
      escape(row.date),
      escape(row.bookingCount),
      escape(row.gross),
      escape(row.commission),
      escape(row.net),
    ].join(',')),
  ];
  return `${lines.join('\n')}\n`;
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatReportLkr(value) {
  return Number(value || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
