import { VenueStatus } from '../constants/apiTypes';

export const VENUE_STATUS_OPTIONS = Object.freeze(Object.values(VenueStatus));
export const LIVE_VENUE_STATUSES = Object.freeze([
  VenueStatus.APPROVED,
  VenueStatus.ACTIVE,
]);
export const PENDING_VENUE_STATUSES = Object.freeze([
  VenueStatus.DRAFT,
  VenueStatus.PENDING_APPROVAL,
]);

const liveStatuses = new Set(LIVE_VENUE_STATUSES);
const pendingStatuses = new Set(PENDING_VENUE_STATUSES);

export const isLiveVenueStatus = (status) => liveStatuses.has(status);
export const isPendingVenueStatus = (status) => pendingStatuses.has(status);

export const venueStatusLabel = (status) => String(status || '')
  .toLowerCase()
  .split('_')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');
