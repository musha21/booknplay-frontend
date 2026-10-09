export const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
export const WEEKEND_DAYS = ['SATURDAY', 'SUNDAY'];
export const ALL_DAYS = [...WEEKDAYS, ...WEEKEND_DAYS];

export const defaultPriority = (ruleType) => {
  if (ruleType === 'WEEKEND') return 30;
  if (ruleType === 'PEAK') return 20;
  return 10;
};

export const effectiveType = (rule) => {
  if (rule?.ruleType) return rule.ruleType;
  if (WEEKEND_DAYS.includes(rule?.dayOfWeek)) return 'WEEKEND';
  return 'CUSTOM';
};

export const effectivePriority = (rule) => {
  if (rule?.priority != null && rule.priority !== '') return Number(rule.priority);
  return defaultPriority(effectiveType(rule));
};

/** Mirror of backend CourtPriceResolver for owner preview. */
export const resolveSlotPrice = (hourlyRate, rules, slotStart, slotEnd) => {
  const base = Number(hourlyRate) || 0;
  const list = Array.isArray(rules) ? rules : [];
  let best = null;
  for (const rule of list) {
    const start = String(rule.startTime || '').slice(0, 5);
    const end = String(rule.endTime || '').slice(0, 5);
    if (!start || !end) continue;
    if (slotStart < start || slotEnd > end) continue;
    if (!best
      || effectivePriority(rule) > effectivePriority(best)
      || (effectivePriority(rule) === effectivePriority(best)
        && defaultPriority(effectiveType(rule)) > defaultPriority(effectiveType(best)))) {
      best = rule;
    }
  }
  return best != null && best.price != null && best.price !== '' ? Number(best.price) : base;
};

export const buildDayPreview = (hourlyRate, rules, dayOfWeek, open = '08:00', close = '22:00') => {
  const dayRules = (rules || []).filter((r) => r.dayOfWeek === dayOfWeek);
  const slots = [];
  let [h] = open.split(':').map(Number);
  const [closeH] = close.split(':').map(Number);
  while (h < closeH) {
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    slots.push({
      startTime: start,
      endTime: end,
      price: resolveSlotPrice(hourlyRate, dayRules, start, end),
    });
    h += 1;
  }
  return slots;
};

export const peakBandRules = ({ startTime = '18:00', endTime = '22:00', price, label = 'Evening peak' }) =>
  WEEKDAYS.map((dayOfWeek) => ({
    dayOfWeek,
    startTime,
    endTime,
    price: String(price),
    ruleType: 'PEAK',
    priority: 20,
    label,
  }));

export const weekendBandRules = ({ startTime = '08:00', endTime = '22:00', price, label = 'Weekend' }) =>
  WEEKEND_DAYS.map((dayOfWeek) => ({
    dayOfWeek,
    startTime,
    endTime,
    price: String(price),
    ruleType: 'WEEKEND',
    priority: 30,
    label,
  }));

/** Replace existing rules of the given type with next, keep others. */
export const upsertRulesByType = (draft, ruleType, nextRules) => {
  const kept = (draft || []).filter((r) => effectiveType(r) !== ruleType);
  return [...kept, ...nextRules];
};

export const toApiRule = (rule) => {
  const startTime = rule.startTime.length === 5 ? `${rule.startTime}:00` : rule.startTime;
  const endTime = rule.endTime.length === 5 ? `${rule.endTime}:00` : rule.endTime;
  const ruleType = effectiveType(rule);
  return {
    dayOfWeek: rule.dayOfWeek,
    startTime,
    endTime,
    price: Number(rule.price),
    ruleType,
    priority: effectivePriority(rule),
    label: rule.label || undefined,
  };
};
