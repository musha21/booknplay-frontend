import { ArrowForward, LocationOn } from '@mui/icons-material';

export default function CityDestinationCard({ city, onSelect }) {
  const available = city === 'Kandy';
  return (
    <button type="button" onClick={onSelect} disabled={!available}>
      <LocationOn />
      <b>{city}</b>
      <span>{available ? 'Explore Kandy venues' : 'Coming soon'}</span>
      {available && <ArrowForward fontSize="small" />}
    </button>
  );
}
