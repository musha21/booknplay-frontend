import { describe, expect, it } from 'vitest';
import {
  buildOwnerNavLinks,
  ownerNavHint,
  ownerPageTitle,
  resolveOwnerHomePath,
  todayOperations,
} from './ownerOverview';

describe('todayOperations', () => {
  it('reads today’s booking count and gross from the earnings summary', () => {
    expect(todayOperations({ bookingCount: 3, gross: 4500, daily: [] })).toEqual({
      bookings: 3,
      revenue: 4500,
    });
  });

  it('returns nothing when the summary has not arrived', () => {
    expect(todayOperations(null)).toBeNull();
    expect(todayOperations({ gross: 100 })).toBeNull();
  });
});

describe('resolveOwnerHomePath', () => {
  it('sends owners with no venues to the venues overview', () => {
    expect(resolveOwnerHomePath([])).toBe('/owner/venues');
    expect(resolveOwnerHomePath(null)).toBe('/owner/venues');
  });

  it('prefers a live venue calendar as the owner home', () => {
    expect(resolveOwnerHomePath([
      { id: 'draft-1', status: 'DRAFT' },
      { id: 'live-1', status: 'ACTIVE' },
    ])).toBe('/owner/venues/live-1/calendar');
  });

  it('falls back to the first venue calendar when none are live', () => {
    expect(resolveOwnerHomePath([
      { id: 'draft-1', status: 'DRAFT' },
      { id: 'draft-2', status: 'PENDING' },
    ])).toBe('/owner/venues/draft-1/calendar');
  });
});

describe('buildOwnerNavLinks', () => {
  it('includes Calendar and Bookable spaces when a venue is selected', () => {
    const links = buildOwnerNavLinks({ role: 'BUSINESS_OWNER', venueId: 'venue-1', venueCount: 2 });
    const labels = links.map((link) => link.label);
    expect(labels).toContain('Calendar');
    expect(labels).toContain('Bookable spaces');
    expect(labels).toContain('Venues');
    expect(labels).toContain('Team');
    expect(labels).not.toContain('Courts');
    expect(links.find((link) => link.label === 'Bookable spaces').to).toBe('/owner/venues/venue-1/courts');
  });

  it('points an owner with no venue to create one', () => {
    const labels = buildOwnerNavLinks({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 0 })
      .map((link) => link.label);
    expect(labels).toContain('Create venue');
    expect(labels).not.toContain('Calendar');
    expect(labels).not.toContain('Bookable spaces');
    expect(ownerNavHint({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 0 })).toBe('');
  });

  it('asks the owner to choose a venue when one exists but none is open', () => {
    const labels = buildOwnerNavLinks({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 1 })
      .map((link) => link.label);
    expect(labels).not.toContain('Bookable spaces');
    expect(ownerNavHint({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 1 }))
      .toBe('Choose a venue above to open Calendar and Bookable spaces.');
  });

  it('includes Earnings and Reports for business owners', () => {
    const labels = buildOwnerNavLinks({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 1 })
      .map((link) => link.label);
    expect(labels).toContain('Earnings');
    expect(labels).toContain('Reports');
    expect(labels).toContain('Billing');
    expect(labels).toContain('Business profile');
  });

  it('hides money links from staff', () => {
    const labels = buildOwnerNavLinks({ role: 'STAFF', venueId: 'venue-1', venueCount: 1 })
      .map((link) => link.label);
    expect(labels).not.toContain('Earnings');
    expect(labels).not.toContain('Reports');
    expect(labels).not.toContain('Billing');
    expect(labels).not.toContain('Team');
    expect(labels).not.toContain('Business profile');
  });
});

describe('ownerPageTitle', () => {
  it.each([
    ['/owner', 'Venues'],
    ['/owner/', 'Venues'],
    ['/owner/venues', 'Venues'],
    ['/owner/venues/new', 'Create venue'],
    ['/owner/venues/venue-1/calendar', 'Calendar'],
    ['/owner/venues/venue-1/courts', 'Bookable spaces'],
    ['/owner/venues/venue-1/booking-policy', 'Booking policy'],
    ['/owner/earnings', 'Earnings'],
    ['/owner/reports', 'Reports'],
    ['/owner/reports/trends', 'Reports'],
    ['/owner/team', 'Team'],
    ['/owner/billing', 'Billing'],
    ['/owner/billing/return', 'Billing'],
    ['/owner/profile', 'Business profile'],
  ])('maps %s to %s', (pathname, expected) => {
    expect(ownerPageTitle(pathname)).toBe(expected);
  });
});
