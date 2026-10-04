import { describe, expect, it } from 'vitest';
import { VenueStatus } from '../constants/apiTypes';
import {
  LIVE_VENUE_STATUSES,
  PENDING_VENUE_STATUSES,
  VENUE_STATUS_OPTIONS,
  isLiveVenueStatus,
  isPendingVenueStatus,
  venueStatusLabel,
} from './venueStatus';

describe('venue status contract', () => {
  it('matches the complete backend enum without duplicates', () => {
    expect(VENUE_STATUS_OPTIONS).toEqual([
      VenueStatus.DRAFT,
      VenueStatus.PENDING_APPROVAL,
      VenueStatus.APPROVED,
      VenueStatus.ACTIVE,
      VenueStatus.REJECTED,
      VenueStatus.SUSPENDED,
      VenueStatus.INACTIVE,
      VenueStatus.DELETED,
    ]);
    expect(new Set(VENUE_STATUS_OPTIONS).size).toBe(VENUE_STATUS_OPTIONS.length);
  });

  it('classifies approved and active venues as live', () => {
    expect(LIVE_VENUE_STATUSES).toEqual([VenueStatus.APPROVED, VenueStatus.ACTIVE]);
    expect(isLiveVenueStatus(VenueStatus.APPROVED)).toBe(true);
    expect(isLiveVenueStatus(VenueStatus.ACTIVE)).toBe(true);
  });

  it('classifies draft and pending approval venues as pending', () => {
    expect(PENDING_VENUE_STATUSES).toEqual([VenueStatus.DRAFT, VenueStatus.PENDING_APPROVAL]);
    expect(isPendingVenueStatus(VenueStatus.DRAFT)).toBe(true);
    expect(isPendingVenueStatus(VenueStatus.PENDING_APPROVAL)).toBe(true);
  });

  it.each([
    VenueStatus.REJECTED,
    VenueStatus.SUSPENDED,
    VenueStatus.INACTIVE,
    VenueStatus.DELETED,
  ])('does not classify %s as live or pending', (status) => {
    expect(isLiveVenueStatus(status)).toBe(false);
    expect(isPendingVenueStatus(status)).toBe(false);
  });

  it('formats enum values as readable labels', () => {
    expect(venueStatusLabel(VenueStatus.PENDING_APPROVAL)).toBe('Pending Approval');
  });
});
