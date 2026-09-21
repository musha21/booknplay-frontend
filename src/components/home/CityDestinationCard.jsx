import VenueImage from '../ui/VenueImage';

export default function CityDestinationCard({ city, count, cover, onSelect }) {
  return (
    <button type="button" onClick={onSelect} className="group overflow-hidden rounded-[22px] border border-line bg-surface text-left shadow-sm transition hover:-translate-y-1">
      <VenueImage src={cover} alt="" className="aspect-[16/10] h-auto w-full object-cover" />
      <span className="block p-4">
        <strong className="block text-lg font-black text-ink">{city}</strong>
        <small className="text-muted">{count} venue{count === 1 ? '' : 's'}</small>
      </span>
    </button>
  );
}
