import { SportsTennis } from '@mui/icons-material';
import { mediaUrl } from '../../utils/mediaUrl';

export default function VenueImage({ src, alt, className = '', iconClassName = '' }) {
  const image = mediaUrl(src);
  if (image) return <img src={image} alt={alt || ''} className={className} loading="lazy" />;
  return (
    <div role="img" aria-label={alt || 'Sports venue'} className={`image-placeholder brand-grid flex items-center justify-center ${className}`}>
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lime-300 backdrop-blur ${iconClassName}`}>
        <SportsTennis sx={{ fontSize: 34 }} />
      </div>
    </div>
  );
}

