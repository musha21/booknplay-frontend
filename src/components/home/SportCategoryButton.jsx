import { motion, useReducedMotion } from 'motion/react';
import SportIcon from '../ui/SportIcon';
import { fadeUp, reducedFade, staggerContainer } from '../../motion/variants';

export default function SportCategoryButton({ sport, selected, onSelect }) {
  const label = sport.displayName || sport.name;
  const isAll = Boolean(sport.all);
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={`hp-sport-tile ${isAll ? 'is-all' : ''} ${selected ? 'is-active' : ''}`}
    >
      {!isAll && (
        <span className="hp-sport-symbol" aria-hidden="true">
          <SportIcon name={label} all={false} alt="" size={28} />
        </span>
      )}
      <span className="hp-sport-label">{label}</span>
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
      {sports.map((sport) => (
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
