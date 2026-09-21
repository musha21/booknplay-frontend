const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim());

export function businessFromVenue(venue) {
  if (!venue) return null;
  const source = venue.business || venue.ownerBusiness || {};
  const id = firstValue(source.id, venue.businessId, venue.ownerBusinessId);
  const name = firstValue(source.name, source.businessName, venue.businessName, venue.ownerBusinessName);
  if (!id && !name) return null;

  return {
    id: String(id || name).toLowerCase(),
    name: String(name || 'Venue partner'),
    imageUrl: firstValue(source.logoUrl, source.profileImageUrl, source.imageUrl, venue.businessLogoUrl, venue.businessImageUrl),
    city: firstValue(source.city, venue.city, venue.formattedAddress),
    venues: [venue],
  };
}

export function groupVenuesByBusiness(venues = []) {
  const businesses = new Map();
  venues.forEach((venue) => {
    const business = businessFromVenue(venue);
    if (!business) return;
    const existing = businesses.get(business.id);
    if (existing) {
      existing.venues.push(venue);
      if (!existing.imageUrl && business.imageUrl) existing.imageUrl = business.imageUrl;
    } else {
      businesses.set(business.id, business);
    }
  });
  return [...businesses.values()];
}
