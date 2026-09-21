import { createElement } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { sportAccent, sportIcon } from '../../utils/venue';
import { fadeUp, reducedFade, staggerContainer } from '../../motion/variants';

export default function SportCategoryButton({ sport, selected, count, onSelect }) {
  const accent = sportAccent(sport.name);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-28 min-w-36 snap-start flex-col justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${selected ? 'bg-navy-900 text-white' : 'border-line bg-surface text-ink'}`}
      style={{ borderColor: selected ? accent : undefined, boxShadow: selected ? `0 0 0 2px ${accent}` : undefined }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: selected ? accent : `${accent}33`, color: selected ? '#061032' : undefined }}>
        {createElement(sportIcon(sport.name), { className: 'transition group-hover:-translate-y-0.5' })}
      </span>
      <span><strong className="block text-sm">{sport.name}</strong>{count > 0 ? <small className={selected ? 'text-slate-300' : 'text-muted'}>{count} venue{count === 1 ? '' : 's'}</small> : <small className={selected ? 'text-slate-300' : 'text-muted'}>Browse</small>}</span>
    </button>
  );
}

export function SportCategoryGrid({ sports, sportId, venueCounts, onSelect }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? undefined : staggerContainer(0.05)}
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'show'}
      viewport={{ once: true, amount: 0.2 }}
      className="mt-7 flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6"
    >
      {sports.slice(0, 6).map((sport) => (
        <motion.div key={sport.id} variants={reduced ? reducedFade : fadeUp} className="shrink-0 sm:shrink">
          <SportCategoryButton
            sport={sport}
            selected={String(sportId) === String(sport.id)}
            count={venueCounts[sport.id]}
            onSelect={() => onSelect(sport)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
