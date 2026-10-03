import { isLiveVenueStatus, isPendingVenueStatus } from './venueStatus';

export function calculateVenueSetup(venue) {
  if (!venue) {
    return {
      percent: 0,
      isComplete: false,
      checklist: [],
      nextIncompleteStep: null,
    };
  }

  // Check backend provided setupPercent if present and numeric
  const hasBackendSetup = typeof venue.setupPercent === 'number';

  const hasLocation = Boolean(venue.formattedAddress || venue.address || venue.city);
  const courtsCount = venue.courtCount ?? venue.courts?.length ?? venue.facilityCount ?? 0;
  const hasCourts = courtsCount > 0;
  const hasHours = Array.isArray(venue.hours) ? venue.hours.length > 0 : Boolean(venue.operatingHours);
  const hasPricing = Boolean(venue.startingPrice || venue.hasPricing || (venue.courts && venue.courts.some((c) => c.price > 0)));
  const hasPolicy = Boolean(venue.cancellationPolicy || venue.policy);

  const checklist = [
    {
      id: 'location',
      title: 'Venue Location & Address',
      isDone: hasLocation,
      to: `/owner/venues/${venue.id}/courts`,
      label: 'Set location',
    },
    {
      id: 'courts',
      title: 'Bookable spaces',
      isDone: hasCourts,
      to: `/owner/venues/${venue.id}/courts`,
      label: 'Add spaces',
    },
    {
      id: 'hours',
      title: 'Operating Hours',
      isDone: hasHours,
      to: `/owner/venues/${venue.id}/calendar`,
      label: 'Set hours',
    },
    {
      id: 'pricing',
      title: 'Space pricing grid',
      isDone: hasPricing,
      to: `/owner/venues/${venue.id}/courts`,
      label: 'Set pricing',
    },
    {
      id: 'policy',
      title: 'Booking & Cancellation Policy',
      isDone: hasPolicy,
      to: `/owner/venues/${venue.id}/booking-policy`,
      label: 'Set policy',
    },
  ];

  const completedItems = checklist.filter((item) => item.isDone).length;
  const derivedPercent = Math.round((completedItems / checklist.length) * 100);

  // A venue that is already publicly bookable has completed onboarding even
  // when an older backend setup score still reports less than 100 percent.
  const isLive = isLiveVenueStatus(venue.status);
  const percent = isLive ? 100 : (hasBackendSetup ? venue.setupPercent : derivedPercent);
  const isComplete = isLive || percent >= 100;
  const nextIncompleteStep = isComplete ? null : (checklist.find((item) => !item.isDone) || null);

  return {
    percent,
    isComplete,
    checklist,
    nextIncompleteStep,
  };
}

export function findVenueNeedingSetup(venues = []) {
  for (const venue of venues) {
    if (!isPendingVenueStatus(venue?.status)) continue;
    const setup = calculateVenueSetup(venue);
    if (!setup.isComplete) return { venue, setup };
  }
  return null;
}
