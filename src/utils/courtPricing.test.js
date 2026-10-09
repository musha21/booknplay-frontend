import { describe, expect, it } from 'vitest';
import {
  buildDayPreview,
  peakBandRules,
  resolveSlotPrice,
  upsertRulesByType,
  weekendBandRules,
} from './courtPricing';

describe('courtPricing', () => {
  it('falls back to hourly rate', () => {
    expect(resolveSlotPrice(3000, [], '16:00', '17:00')).toBe(3000);
  });

  it('applies peak over normal', () => {
    const rules = peakBandRules({ price: 4000 });
    expect(resolveSlotPrice(3000, rules, '19:00', '20:00')).toBe(4000);
    expect(resolveSlotPrice(3000, rules, '16:00', '17:00')).toBe(3000);
  });

  it('weekend beats peak when both match', () => {
    const rules = [
      {
        dayOfWeek: 'SATURDAY',
        startTime: '18:00',
        endTime: '22:00',
        price: '4000',
        ruleType: 'PEAK',
        priority: 20,
      },
      ...weekendBandRules({ price: 4500 }),
    ];
    expect(resolveSlotPrice(3000, rules, '19:00', '20:00')).toBe(4500);
  });

  it('upsertRulesByType replaces only that type', () => {
    const draft = [
      ...peakBandRules({ price: 4000 }),
      ...weekendBandRules({ price: 4500 }),
    ];
    const next = upsertRulesByType(draft, 'PEAK', peakBandRules({ price: 4200 }));
    expect(next.filter((r) => r.ruleType === 'PEAK').every((r) => String(r.price) === '4200')).toBe(true);
    expect(next.filter((r) => r.ruleType === 'WEEKEND')).toHaveLength(2);
  });

  it('buildDayPreview lists hours', () => {
    const preview = buildDayPreview(3000, peakBandRules({ price: 4000 }), 'MONDAY', '17:00', '20:00');
    expect(preview).toEqual([
      { startTime: '17:00', endTime: '18:00', price: 3000 },
      { startTime: '18:00', endTime: '19:00', price: 4000 },
      { startTime: '19:00', endTime: '20:00', price: 4000 },
    ]);
  });
});
