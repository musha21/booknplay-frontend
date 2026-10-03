import { createElement } from 'react';
import { ArrowForward, Flare } from '@mui/icons-material';
import { motion, useReducedMotion } from 'motion/react';
import { sportIcon } from '../../utils/venue';
import { fadeUp, reducedFade, staggerContainer } from '../../motion/variants';

export default function SportCategoryButton({ sport, selected, onSelect }) {
  const label = sport.displayName || sport.name;
  const Icon = sport.all ? Flare : sportIcon(sport.name);
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onSelect}
      className={`hp-sport-tile ${selected ? 'is-active' : ''}`}
    >
      <span className="hp-sport-symbol" aria-hidden="true">{createElement(Icon)}</span>
      <span>{label}</span>
      <ArrowForward className="hp-tile-arrow" />
    </button>
  );
}

export function SportCategoryGrid({ sports, sportId, onSelect }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? undefined : staggerContainer(0.05)}
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'show'}
      viewport={{ once: true, amount: 0.2 }}
      className="hp-sport-grid"
    >
      {sports.slice(0, 4).map((sport) => (
        <motion.div key={sport.id || sport.name} variants={reduced ? reducedFade : fadeUp}>
          <SportCategoryButton
            sport={sport}
            selected={String(sportId) === String(sport.id)}
            onSelect={() => onSelect(sport)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
