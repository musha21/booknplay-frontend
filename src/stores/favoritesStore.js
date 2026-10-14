import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      savedVenueIds: [],

      isFavorite: (venueId) => {
        if (!venueId) return false;
        return get().savedVenueIds.some((id) => String(id) === String(venueId));
      },

      toggleFavorite: (venueId, venueName = 'Venue') => {
        if (!venueId) return;
        const stringId = String(venueId);
        const current = get().savedVenueIds;
        const exists = current.some((id) => String(id) === stringId);

        if (exists) {
          set({ savedVenueIds: current.filter((id) => String(id) !== stringId) });
          toast.success(`Removed ${venueName} from favourites`);
        } else {
          set({ savedVenueIds: [...current, stringId] });
          toast.success(`Saved ${venueName} to favourites`);
        }
      },

      removeFavorite: (venueId, venueName = 'Venue') => {
        if (!venueId) return;
        const stringId = String(venueId);
        set({ savedVenueIds: get().savedVenueIds.filter((id) => String(id) !== stringId) });
        toast.success(`Removed ${venueName} from favourites`);
      },

      clearFavorites: () => set({ savedVenueIds: [] }),
    }),
    {
      name: 'booknplay-favourites',
      partialize: (state) => ({ savedVenueIds: state.savedVenueIds }),
    }
  )
);

export default useFavoritesStore;
