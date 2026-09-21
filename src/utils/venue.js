import {
  Casino,
  Pool,
  SportsBasketball,
  SportsCricket,
  SportsSoccer,
  SportsTennis,
  SportsVolleyball,
} from '@mui/icons-material';

export function venueCover(venue) {
  if (!venue) return '';
  if (venue.coverImageUrl) return venue.coverImageUrl;
  if (Array.isArray(venue.images) && venue.images[0]) return venue.images[0];
  return venue.businessImageUrl || venue.imageUrl || '';
}

export function venuePrice(venue) {
  const value = venue?.startingPrice ?? venue?.minPrice ?? venue?.hourlyRate;
  return Number(value || 0);
}

export function venueSportLabel(venue) {
  return venue?.sportName || venue?.venueType || venue?.sportType || 'Multi-sport venue';
}

export function sportAccent(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('cricket')) return '#84cc16';
  if (n.includes('futsal') || n.includes('football') || n.includes('soccer')) return '#3b82f6';
  if (n.includes('badminton')) return '#22d3ee';
  if (n.includes('basket')) return '#f97316';
  if (n.includes('swim')) return '#06b6d4';
  if (n.includes('tennis') || n.includes('padel')) return '#a3e635';
  return '#a3e635';
}

export function sportIcon(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('cricket')) return SportsCricket;
  if (n.includes('futsal') || n.includes('football') || n.includes('soccer')) return SportsSoccer;
  if (n.includes('basket')) return SportsBasketball;
  if (n.includes('volley')) return SportsVolleyball;
  if (n.includes('pool') && !n.includes('swim')) return Casino;
  if (n.includes('swim')) return Pool;
  return SportsTennis;
}
