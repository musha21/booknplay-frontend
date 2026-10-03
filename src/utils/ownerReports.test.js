import { describe, expect, it } from 'vitest';
import {
  REPORT_RANGE_PRESETS,
  buildEarningsCsv,
  normalizeDailyRows,
  reportRangeDates,
} from './ownerReports';
import dayjs from 'dayjs';

describe('reportRangeDates', () => {
  const now = dayjs('2026-10-15');

  it('uses an inclusive last-7-days window', () => {
    expect(reportRangeDates(REPORT_RANGE_PRESETS.LAST_7_DAYS, now)).toEqual({
      from: '2026-10-09',
      to: '2026-10-15',
    });
  });

  it('defaults to the last 30 days', () => {
    expect(reportRangeDates(REPORT_RANGE_PRESETS.LAST_30_DAYS, now)).toEqual({
      from: '2026-09-16',
      to: '2026-10-15',
    });
  });

  it('starts this month from the first calendar day', () => {
    expect(reportRangeDates(REPORT_RANGE_PRESETS.THIS_MONTH, now)).toEqual({
      from: '2026-10-01',
      to: '2026-10-15',
    });
  });
});

describe('normalizeDailyRows', () => {
  it('maps and fills missing net from gross', () => {
    expect(normalizeDailyRows({
      daily: [
        { date: '2026-10-01', bookingCount: 2, gross: 1000, commission: 100 },
        { date: '', bookingCount: 1 },
      ],
    })).toEqual([
      { date: '2026-10-01', bookingCount: 2, gross: 1000, commission: 100, net: 1000 },
    ]);
  });
});

describe('buildEarningsCsv', () => {
  it('writes a header and escaped rows', () => {
    const csv = buildEarningsCsv([
      { date: '2026-10-01', bookingCount: 2, gross: 1000.5, commission: 100, net: 900.5 },
    ]);
    expect(csv).toBe(
      'Date,Bookings,Gross,Commission,Net\n2026-10-01,2,1000.5,100,900.5\n',
    );
  });
});
