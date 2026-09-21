import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { motion, useReducedMotion } from 'motion/react';
import VenueImage from './VenueImage';
import { formatCurrency } from '../../utils/formatters';
import { sportAccent, venueCover, venuePrice, venueSportLabel } from '../../utils/venue';
import { buttonPress, fadeUp, imageReveal, reducedFade } from '../../motion/variants';

export default function VenueCard({ venue, actionLabel = 'View venue' }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  if (!venue?.id) return null;
  const sport = venueSportLabel(venue);

  return (
    <motion.article
      variants={reduced ? reducedFade : fadeUp}
      className="surface-card overflow-hidden"
      whileHover={reduced ? undefined : { y: -4 }}
    >
      <motion.div className="overflow-hidden" initial="rest" whileHover={reduced ? undefined : 'hover'} variants={imageReveal}>
        <VenueImage src={venueCover(venue)} alt={venue.name} className="aspect-[16/10] h-auto w-full object-cover" />
      </motion.div>
      <div className="p-5">
        <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: `${sportAccent(sport)}22`, color: sportAccent(sport) }}>{sport}</span>
        <h3 className="mt-2 line-clamp-1 text-lg font-black text-ink">{venue.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm font-bold text-ink">{venue.businessName || venue.business?.name || ''}</p>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted">
          <LocationOn fontSize="small" />
          {venue.city || venue.formattedAddress || venue.address || 'Sri Lanka'}
        </p>
        {venue.rating ? <p className="mt-1 text-xs font-bold text-muted">Rating {venue.rating}</p> : null}
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <span className="block text-xs text-muted">Starting from</span>
            <strong className="text-ink">
              {formatCurrency(venuePrice(venue), venue.currency || 'LKR')}
              <span className="text-xs font-medium text-muted"> / hour</span>
            </strong>
          </div>
          <motion.span whileTap={reduced ? undefined : buttonPress}>
            <Button variant="contained" onClick={() => navigate(`/venues/${venue.id}`)}>{actionLabel}</Button>
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}
