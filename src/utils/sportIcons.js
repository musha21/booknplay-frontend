import allIcon from '../assets/icons/sports/all.svg';
import cricketIcon from '../assets/icons/sports/cricket.png';
import soccerIcon from '../assets/icons/sports/soccer.png';
import volleyballIcon from '../assets/icons/sports/volleyball.png';
import tennisIcon from '../assets/icons/sports/tennis.png';
import padelIcon from '../assets/icons/sports/padel.png';
import badmintonIcon from '../assets/icons/sports/badminton.png';
import basketballIcon from '../assets/icons/sports/basketball.png';
import poolIcon from '../assets/icons/sports/pool.png';
import swimIcon from '../assets/icons/sports/swim.png';

const ICONS = {
  all: allIcon,
  cricket: cricketIcon,
  soccer: soccerIcon,
  volleyball: volleyballIcon,
  tennis: tennisIcon,
  padel: padelIcon,
  badminton: badmintonIcon,
  basketball: basketballIcon,
  pool: poolIcon,
  swim: swimIcon,
};

/** Resolve a sport pictogram asset by sport name / display label. */
export function sportIconSrc(name = '', { all = false } = {}) {
  if (all) return ICONS.all;
  const n = String(name).toLowerCase();
  if (n.includes('cricket')) return ICONS.cricket;
  if (n.includes('badminton')) return ICONS.badminton;
  if (n.includes('futsal') || n.includes('football') || n.includes('soccer')) return ICONS.soccer;
  if (n.includes('basket')) return ICONS.basketball;
  if (n.includes('volley')) return ICONS.volleyball;
  if (n.includes('padel') || n.includes('pickle')) return ICONS.padel;
  if (n.includes('table tennis') || n.includes('tabletennis') || n.includes('ping pong')) return ICONS.tennis;
  if (n.includes('squash')) return ICONS.tennis;
  if (n.includes('pool') && !n.includes('swim')) return ICONS.pool;
  if (n.includes('swim')) return ICONS.swim;
  if (n.includes('tennis')) return ICONS.tennis;
  return ICONS.all;
}
