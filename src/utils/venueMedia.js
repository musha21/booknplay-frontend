import { mediaUrl } from './mediaUrl';

/** Ordered gallery URLs for carousels: media → images → imageUrls → cover → business image. */
export function venueMediaList(venue) {
  if (!venue) return [];
  const fromMedia = Array.isArray(venue.media)
    ? [...venue.media]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((item) => item?.url)
        .filter(Boolean)
    : [];
  if (fromMedia.length) return fromMedia.map((url) => mediaUrl(url) || url);

  const fromImages = Array.isArray(venue.images)
    ? venue.images.map((item) => (typeof item === 'string' ? item : item?.url)).filter(Boolean)
    : [];
  if (fromImages.length) return fromImages.map((url) => mediaUrl(url) || url);

  const fromImageUrls = Array.isArray(venue.imageUrls)
    ? venue.imageUrls.map((item) => (typeof item === 'string' ? item : item?.url)).filter(Boolean)
    : [];
  if (fromImageUrls.length) return fromImageUrls.map((url) => mediaUrl(url) || url);

  const cover = venue.coverImageUrl || venue.businessImageUrl || venue.imageUrl;
  return cover ? [mediaUrl(cover) || cover] : [];
}

export function venueBusinessLogo(venue, owner) {
  return mediaUrl(
    venue?.businessLogoUrl
    || owner?.logoUrl
    || venue?.businessImageUrl
    || ''
  ) || '';
}

export function businessInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'B';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
