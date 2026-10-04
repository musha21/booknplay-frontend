import { describe, expect, it } from 'vitest';
import { calculateVenueSetup, findVenueNeedingSetup } from './venueSetup';

describe('calculateVenueSetup utility', () => {
  it('returns 0% and empty checklist for null or empty venue', () => {
    const res = calculateVenueSetup(null);
    expect(res.percent).toBe(0);
    expect(res.isComplete).toBe(false);
    expect(res.nextIncompleteStep).toBeNull();
  });

  it('uses backend setupPercent if available', () => {
    const venue = {
      id: 'v1',
      setupPercent: 75,
      formattedAddress: '123 Main St',
      courtCount: 2,
    };
    const res = calculateVenueSetup(venue);
    expect(res.percent).toBe(75);
    expect(res.isComplete).toBe(false);
  });

  it('derives percentage based on completed checklist items when setupPercent is missing', () => {
    const partialVenue = {
      id: 'v2',
      formattedAddress: '456 Kandy Rd',
      courtCount: 3,
    };
    const res = calculateVenueSetup(partialVenue);
    // 2 out of 5 items done => 40%
    expect(res.percent).toBe(40);
    expect(res.isComplete).toBe(false);
    expect(res.nextIncompleteStep.id).toBe('hours');
  });

  it('marks setup 100% complete when all criteria are satisfied', () => {
    const completeVenue = {
      id: 'v3',
      formattedAddress: '789 Galle Rd',
      courtCount: 4,
      hours: [{ dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '22:00' }],
      hasPricing: true,
      cancellationPolicy: { hoursBeforeDeadline: 24, refundPercentage: 100 },
    };
    const res = calculateVenueSetup(completeVenue);
    expect(res.percent).toBe(100);
    expect(res.isComplete).toBe(true);
    expect(res.nextIncompleteStep).toBeNull();
  });

  it.each(['ACTIVE', 'APPROVED'])('treats a %s venue as complete even with a stale 80% score', (status) => {
    const res = calculateVenueSetup({
      id: 'live-venue',
      status,
      setupPercent: 80,
      formattedAddress: '123 Main St',
      courtCount: 2,
    });

    expect(res.percent).toBe(100);
    expect(res.isComplete).toBe(true);
    expect(res.nextIncompleteStep).toBeNull();
  });

  it('only selects draft or pending venues for setup guidance', () => {
    const result = findVenueNeedingSetup([
      { id: 'live', status: 'ACTIVE', setupPercent: 80 },
      { id: 'draft', status: 'DRAFT', setupPercent: 40, formattedAddress: 'Kandy' },
    ]);

    expect(result.venue.id).toBe('draft');
    expect(result.setup.isComplete).toBe(false);
  });

  it('returns no setup guidance when every venue is already live', () => {
    expect(findVenueNeedingSetup([
      { id: 'active', status: 'ACTIVE', setupPercent: 80 },
      { id: 'approved', status: 'APPROVED', setupPercent: 60 },
    ])).toBeNull();
  });
});
