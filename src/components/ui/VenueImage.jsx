import { mediaUrl } from '../../utils/mediaUrl';
import SportIcon from './SportIcon';

export default function VenueImage({ src, alt, className = '', iconClassName = '', sportName = '', eager = false, fetchPriority }) {
  const image = mediaUrl(src);
  if (image) {
    return (
      <img
        src={image}
        alt={alt || ''}
        className={className}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={fetchPriority || (eager ? 'high' : 'auto')}
      />
    );
  }
  return (
    <div role="img" aria-label={alt || 'Sports venue'} className={`image-placeholder brand-grid flex items-center justify-center ${className}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur ${iconClassName}`}>
        <SportIcon name={sportName} alt="" size={22} className="sport-icon--on-dark" />
      </div>
    </div>
  );
}
