import { FavoriteBorder } from '@mui/icons-material';
import EmptyState from '../../components/ui/EmptyState';

export default function FavouritesPage() {
  return <div className="surface-card p-5 sm:p-7"><p className="eyebrow">Saved places</p><h2 className="mt-2 text-2xl font-black text-ink">Favourite venues</h2><div className="mt-6"><EmptyState icon={FavoriteBorder} title="No saved venues yet" description="Favourites will appear here when venue saving is supported by your account." /></div></div>;
}
