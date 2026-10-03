import { isLiveVenueStatus } from './venueStatus';

export function todayOperations(summary) {
  if (!summary || typeof summary.bookingCount !== 'number' || summary.gross == null) return null;
  return {
    bookings: summary.bookingCount,
    revenue: summary.gross,
  };
}

/** Prefer a live venue calendar; otherwise first venue; empty list → overview. */
export function resolveOwnerHomePath(venues = []) {
  const list = Array.isArray(venues) ? venues : [];
  if (!list.length) return '/owner/venues';
  const live = list.find((venue) => isLiveVenueStatus(venue?.status));
  const venue = live || list[0];
  if (!venue?.id) return '/owner/venues';
  return `/owner/venues/${venue.id}/calendar`;
}

export function buildOwnerNavLinks({ role, venueId, venueCount = 0 }) {
  const isStaff = role === 'STAFF';
  const selectedVenueId = venueId && venueId !== 'new' ? venueId : '';
  const links = [{ to: '/owner/venues', label: 'Venues', end: true }];

  if (selectedVenueId) {
    links.push(
      { to: `/owner/venues/${selectedVenueId}/calendar`, label: 'Calendar' },
      { to: `/owner/venues/${selectedVenueId}/courts`, label: 'Bookable spaces' },
      { to: `/owner/venues/${selectedVenueId}/booking-policy`, label: 'Booking policy' },
    );
  } else if (!isStaff && venueCount === 0) {
    links.push({ to: '/owner/venues/new', label: 'Create venue' });
  }

  if (!isStaff) {
    links.push(
      { to: '/owner/earnings', label: 'Earnings' },
      { to: '/owner/reports', label: 'Reports' },
      { to: '/owner/team', label: 'Team' },
      { to: '/owner/billing', label: 'Billing' },
      { to: '/owner/profile', label: 'Business profile' },
    );
  }

  return links;
}

export function ownerNavHint({ role, venueId, venueCount = 0 }) {
  const selectedVenueId = venueId && venueId !== 'new' ? venueId : '';
  if (selectedVenueId) return '';
  if (venueCount > 0) return 'Choose a venue above to open Calendar and Bookable spaces.';
  if (role === 'STAFF') return 'No venue is available in this workspace yet.';
  return '';
}

export function ownerPageTitle(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/owner';
  if (path === '/owner' || path === '/owner/venues') return 'Venues';
  if (path === '/owner/venues/new') return 'Create venue';
  if (path === '/owner/earnings') return 'Earnings';
  if (path === '/owner/reports' || path.startsWith('/owner/reports/')) return 'Reports';
  if (path === '/owner/team') return 'Team';
  if (path === '/owner/billing' || path.startsWith('/owner/billing/')) return 'Billing';
  if (path === '/owner/profile') return 'Business profile';
  if (/\/owner\/venues\/[^/]+\/edit$/.test(path)) return 'Edit venue';
  if (/\/owner\/venues\/[^/]+\/calendar$/.test(path)) return 'Calendar';
  if (/\/owner\/venues\/[^/]+\/courts$/.test(path)) return 'Bookable spaces';
  if (/\/owner\/venues\/[^/]+\/booking-policy$/.test(path)) return 'Booking policy';
  return 'Owner dashboard';
}

export const OWNER_SIDEBAR_COLLAPSED_KEY = 'owner.sidebarCollapsed';

export function readSidebarCollapsed() {
  try {
    return localStorage.getItem(OWNER_SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(collapsed) {
  try {
    localStorage.setItem(OWNER_SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}
