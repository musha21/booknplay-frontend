import { FavoriteBorder } from '@mui/icons-material';
import EmptyState from '../../components/ui/EmptyState';

export default function FavouritesPage() {
  return (
    <div className="customer-panel p-5 sm:p-7">
      <p className="eyebrow">Saved places</p>
      <h2 className="customer-card-title mt-2">Favourite venues</h2>
      <p className="customer-body mt-2">Keep the venues and bookable spaces you love within easy reach.</p>
      <div className="mt-6 rounded-2xl border border-line bg-canvas/60">
        <EmptyState
          icon={FavoriteBorder}
          title="No saved venues yet"
          description="Favourites will appear here when venue saving is supported by your account."
        />
      </div>
    </div>
  );
}
