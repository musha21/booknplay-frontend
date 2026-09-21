import { motion, useReducedMotion } from 'motion/react';
import { ArrowForward } from '@mui/icons-material';
import VenueImage from '../ui/VenueImage';
import { mediaUrl } from '../../utils/mediaUrl';
import { buttonPress, cardHover, fadeUp, imageReveal, reducedFade } from '../../motion/variants';

export default function PremiumBusinessCard({ business, onView }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      variants={reduced ? reducedFade : fadeUp}
      whileHover={reduced ? undefined : cardHover}
      className="group overflow-hidden rounded-[22px] border border-line bg-navy-900 text-white shadow-lg"
    >
      <motion.div variants={imageReveal} initial="rest" whileHover={reduced ? undefined : 'hover'} className="overflow-hidden">
        <VenueImage src={business.imageUrl || business.logoUrl} alt={business.name} className="h-52 w-full object-cover opacity-90" />
      </motion.div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {business.logoUrl ? <img src={mediaUrl(business.logoUrl)} alt="" className="h-10 w-10 rounded-xl object-cover" /> : null}
            <div className="min-w-0"><h3 className="truncate text-lg font-black">{business.name}</h3></div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-300">{business.cities?.join(', ') || business.address || 'Sri Lanka'}</p>
        <p className="mt-1 text-sm text-slate-400">{business.venueCount || 0} venues{business.sports?.length ? ` · ${business.sports.slice(0, 3).join(', ')}` : ''}</p>
        <motion.button type="button" whileTap={reduced ? undefined : buttonPress} onClick={() => onView(business)} className="mt-5 flex min-h-11 w-full items-center justify-between border-t border-white/15 pt-4 text-sm font-extrabold">
          <span>View venues</span><ArrowForward className="transition group-hover:translate-x-1" fontSize="small" />
        </motion.button>
      </div>
    </motion.article>
  );
}
