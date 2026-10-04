export const MAIN_SPORT_PRIORITY = [
  { label: 'Indoor cricket', matches: ['indoor cricket', 'cricket'] },
  { label: 'Badminton', matches: ['badminton'] },
  { label: 'Futsal', matches: ['futsal', 'football', 'soccer'] },
  { label: 'Basketball', matches: ['basketball', 'basket'] },
  { label: 'Volleyball', matches: ['volleyball', 'volley'] },
  { label: 'Table tennis', matches: ['table tennis', 'tabletennis', 'ping pong'] },
  { label: 'Squash', matches: ['squash'] },
  { label: 'Padel', matches: ['padel'] },
  { label: '8-Ball Pool', matches: ['8-ball', '8 ball', 'billiard', 'pool table', 'pool'] },
  { label: 'Swimming', matches: ['swim', 'swimming'] },
];

export const MAIN_SPORT_FALLBACKS = MAIN_SPORT_PRIORITY.map(({ label }) => ({
  id: label.toLowerCase(),
  name: label,
  displayName: label,
  fallback: true,
}));

export function curateMainSports(items = []) {
  return MAIN_SPORT_PRIORITY.map(({ label, matches }) => {
    const preferredNames = [label, `${label} Court`, `${label} Field`, `${label} Pool`, `${label} Lane`].map((name) => name.toLowerCase());
    const exact = items.find((sport) => preferredNames.includes(String(sport.name).toLowerCase()));
    const match = exact || items.find((sport) => {
      const sportName = String(sport.name).toLowerCase();
      if (label === '8-Ball Pool') {
        return matches.some((term) => sportName.includes(term)) && !sportName.includes('swim');
      }
      if (label === 'Swimming') {
        return matches.some((term) => sportName.includes(term)) && !sportName.includes('pool table');
      }
      return matches.some((term) => sportName.includes(term));
    });
    return match ? { ...match, displayName: label } : null;
  }).filter(Boolean);
}
