// Plain, unique canonical labels. Distinct sports stay separate (Football is NOT
// merged into Futsal); only clear aliases are grouped under a label's `matches`.
export const MAIN_SPORT_PRIORITY = [
  { label: 'Cricket', matches: ['cricket'] },
  { label: 'Badminton', matches: ['badminton'] },
  { label: 'Futsal', matches: ['futsal', 'indoor football'] },
  { label: 'Football', matches: ['football', 'soccer'] },
  { label: 'Basketball', matches: ['basketball', 'basket'] },
  { label: 'Volleyball', matches: ['volleyball', 'volley'] },
  { label: 'Table tennis', matches: ['table tennis', 'tabletennis', 'ping pong'] },
  { label: 'Squash', matches: ['squash'] },
  { label: 'Padel', matches: ['padel'] },
  { label: '8-Ball Pool', matches: ['8-ball', '8 ball', 'billiard', 'pool table', 'pool'] },
  { label: 'Swimming', matches: ['swim', 'swimming'] },
];

/** Homepage "What's your game?" icon grid — top booking sports only. */
export const HOMEPAGE_SHOWCASE_SPORTS = [
  'Cricket',
  'Volleyball',
  'Badminton',
  'Futsal',
  '8-Ball Pool',
];

export const MAIN_SPORT_FALLBACKS = MAIN_SPORT_PRIORITY.map(({ label }) => ({
  id: label.toLowerCase(),
  name: label,
  displayName: label,
  fallback: true,
}));

function matchSportForLabel(items, label, matches) {
  const preferredNames = [label, `${label} Court`, `${label} Field`, `${label} Pool`, `${label} Lane`].map((name) => name.toLowerCase());
  const exact = items.find((sport) => preferredNames.includes(String(sport.name).toLowerCase()));
  return exact || items.find((sport) => {
    const sportName = String(sport.name).toLowerCase();
    if (label === '8-Ball Pool') {
      return matches.some((term) => sportName.includes(term)) && !sportName.includes('swim');
    }
    if (label === 'Swimming') {
      return matches.some((term) => sportName.includes(term)) && !sportName.includes('pool table');
    }
    return matches.some((term) => sportName.includes(term));
  });
}

export function curateMainSports(items = []) {
  return MAIN_SPORT_PRIORITY.map(({ label, matches }) => {
    const match = matchSportForLabel(items, label, matches);
    return match ? { ...match, displayName: label } : null;
  }).filter(Boolean);
}

/** Exactly the homepage showcase sports (with fallbacks if API is missing one). */
export function curateShowcaseSports(items = []) {
  const source = items.length ? items : MAIN_SPORT_FALLBACKS;
  return HOMEPAGE_SHOWCASE_SPORTS.map((label) => {
    const priority = MAIN_SPORT_PRIORITY.find((entry) => entry.label === label);
    const matches = priority?.matches || [label.toLowerCase()];
    const match = matchSportForLabel(source, label, matches);
    if (match) return { ...match, displayName: label };
    return {
      id: label.toLowerCase(),
      name: label,
      displayName: label,
      fallback: true,
    };
  });
}

// Keeps the curated main sports first (in priority order) and then appends any
// API-provided sport that is not already represented, so newly created sports
// (e.g. "Carrom") flow into the global filters automatically without a cap.
export function mergeDynamicSports(curated = [], source = []) {
  const seen = new Set();
  const keyOf = (value) => String(value || '').trim().toLowerCase();
  const results = [];
  [...curated, ...MAIN_SPORT_FALLBACKS.filter((f) => !curated.some((c) => keyOf(c.displayName) === keyOf(f.displayName)))]
    .forEach((sport) => {
      const idKey = keyOf(sport.id);
      const nameKey = keyOf(sport.displayName || sport.name);
      if ((idKey && seen.has(idKey)) || (nameKey && seen.has(nameKey))) return;
      if (idKey) seen.add(idKey);
      if (nameKey) seen.add(nameKey);
      results.push(sport);
    });
  (source || []).forEach((sport) => {
    const idKey = keyOf(sport.id);
    const nameKey = keyOf(sport.displayName || sport.name);
    if ((idKey && seen.has(idKey)) || (nameKey && seen.has(nameKey))) return;
    if (idKey) seen.add(idKey);
    if (nameKey) seen.add(nameKey);
    results.push({ ...sport, displayName: sport.displayName || sport.name });
  });
  return results;
}
