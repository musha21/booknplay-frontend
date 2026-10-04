const normalized = (value) => String(value || '').trim().toLowerCase();

export function resourceLabelForSport(sportName) {
  const sport = normalized(sportName);
  if (sport.includes('futsal') || sport.includes('football') || sport.includes('soccer')) {
    return 'Pitch';
  }
  if (sport.includes('table tennis') || sport.includes('ping pong')) {
    return 'Table';
  }
  if (sport.includes('pool') && !sport.includes('swim')) {
    return 'Pool Table';
  }
  if (sport.includes('swim') || sport.includes('lane')) {
    return 'Lane';
  }
  return 'Court';
}

export function resourceLabelForCourt(court) {
  const explicit = court?.courtType || court?.resource || court?.resourceLabel;
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim();
  return resourceLabelForSport(court?.sportName || court?.sport?.name);
}

export function pluralizeResourceLabel(label, count = 2) {
  const value = String(label || 'Court').trim() || 'Court';
  if (Number(count) === 1) return value;
  if (/(s|x|z|ch|sh)$/i.test(value)) return value + 'es';
  if (/[^aeiou]y$/i.test(value)) return value.slice(0, -1) + 'ies';
  return value + 's';
}

export function buildResourceNames(label, quantity) {
  const count = Math.min(26, Math.max(1, Math.floor(Number(quantity) || 1)));
  const resource = String(label || 'Court').trim() || 'Court';
  return Array.from({ length: count }, (_, index) => (
    resource + ' ' + String.fromCharCode(65 + index)
  ));
}
