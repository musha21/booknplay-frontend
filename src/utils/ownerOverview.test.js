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
  it('always returns the owner dashboard', () => {
    expect(resolveOwnerHomePath([])).toBe('/owner');
    expect(resolveOwnerHomePath(null)).toBe('/owner');
    expect(resolveOwnerHomePath([{ id: 'live-1', status: 'ACTIVE' }])).toBe('/owner');
  });
});

describe('buildOwnerNavLinks', () => {
  it('groups SaaS modules and points calendar at the selected venue when present', () => {
    const links = buildOwnerNavLinks({ role: 'BUSINESS_OWNER', venueId: 'venue-1', venueCount: 2 });
    const labels = links.map((link) => link.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Courts');
    expect(labels).toContain('Bookings');
    expect(labels).toContain('Staff');
    expect(labels).toContain('Settings');
    expect(links.find((link) => link.label === 'Calendar').to).toBe('/owner/venues/venue-1/calendar');
    expect(links.every((link) => link.group)).toBe(true);
  });

  it('points an owner with no venue to create one', () => {
    const labels = buildOwnerNavLinks({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 0 })
      .map((link) => link.label);
    expect(labels).toContain('Create venue');
    expect(ownerNavHint({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 0 })).toBe('');
  });

  it('asks the owner to choose a venue when one exists but none is open', () => {
    expect(ownerNavHint({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 1 }))
      .toBe('Choose a venue above to open its calendar.');
  });

  it('includes commerce and billing for business owners', () => {
    const labels = buildOwnerNavLinks({ role: 'BUSINESS_OWNER', venueId: '', venueCount: 1 })
      .map((link) => link.label);
    expect(labels).toContain('Earnings');
    expect(labels).toContain('Reports');
    expect(labels).toContain('Billing');
    expect(labels).toContain('Promotions');
  });

  it('hides workspace owner links from staff', () => {
    const labels = buildOwnerNavLinks({ role: 'STAFF', venueId: 'venue-1', venueCount: 1 })
      .map((link) => link.label);
    expect(labels).not.toContain('Billing');
    expect(labels).not.toContain('Staff');
    expect(labels).not.toContain('Settings');
    expect(labels).toContain('Bookings');
  });

  it('hides promotions and reports when subscription limits disable them', () => {
    const labels = buildOwnerNavLinks({
      role: 'BUSINESS_OWNER',
      venueId: '',
      venueCount: 1,
      subscription: { limits: { promotionsEnabled: false, reportsEnabled: false } },
    }).map((link) => link.label);
    expect(labels).not.toContain('Promotions');
    expect(labels).not.toContain('Reports');
  });
});

describe('ownerPageTitle', () => {
  it.each([
    ['/owner', 'Dashboard'],
    ['/owner/', 'Dashboard'],
    ['/owner/venues', 'Venues'],
    ['/owner/venues/new', 'Create venue'],
    ['/owner/courts', 'Courts'],
    ['/owner/bookings', 'Bookings'],
    ['/owner/calendar', 'Calendar'],
    ['/owner/walk-in', 'Walk-in'],
    ['/owner/promotions', 'Promotions'],
    ['/owner/settings', 'Settings'],
    ['/owner/reviews', 'Reviews'],
    ['/owner/venues/venue-1/calendar', 'Calendar'],
    ['/owner/venues/venue-1/courts', 'Courts'],
    ['/owner/venues/venue-1/booking-policy', 'Booking policy'],
    ['/owner/earnings', 'Earnings'],
    ['/owner/reports', 'Reports'],
    ['/owner/reports/trends', 'Reports'],
    ['/owner/team', 'Staff'],
    ['/owner/billing', 'Billing'],
    ['/owner/billing/return', 'Billing'],
    ['/owner/profile', 'Business profile'],
  ])('maps %s to %s', (pathname, expected) => {
    expect(ownerPageTitle(pathname)).toBe(expected);
  });
});
