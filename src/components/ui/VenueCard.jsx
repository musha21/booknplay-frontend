import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import VenueImage from './VenueImage';
import { formatCurrency } from '../../utils/formatters';
import { venueCover, venuePrice, venueSportLabel } from '../../utils/venue';

export default function VenueCard({ venue, actionLabel = 'View venue' }) {
  const navigate = useNavigate();
  if (!venue?.id) return null;

  return (
    <article className="surface-card overflow-hidden transition hover:-translate-y-0.5">
      <VenueImage src={venueCover(venue)} alt={venue.name} className="h-48 w-full object-cover" />
      <div className="p-5">
        <p className="text-xs font-bold text-lime-700 dark:text-lime-400">{venueSportLabel(venue)}</p>
        <h3 className="mt-1 text-lg font-black text-ink">{venue.name}</h3>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted">
          <LocationOn fontSize="small" />
          {venue.city || venue.formattedAddress || venue.address || 'Sri Lanka'}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <span className="block text-xs text-muted">Starting from</span>
            <strong className="text-ink">
              {formatCurrency(venuePrice(venue), venue.currency || 'LKR')}
              <span className="text-xs font-medium text-muted"> / hour</span>
            </strong>
          </div>
          <Button variant="contained" onClick={() => navigate(`/venues/${venue.id}`)}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
