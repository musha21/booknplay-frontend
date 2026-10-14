export function todayOperations(summary) {
  if (!summary || typeof summary.bookingCount !== 'number' || summary.gross == null) return null;
  return {
    bookings: summary.bookingCount,
    revenue: summary.gross,
  };
}

/** Owner home is always the SaaS dashboard. */
export function resolveOwnerHomePath() {
  return '/owner';
}

const GROUP = {
  OVERVIEW: 'Overview',
  OPERATIONS: 'Operations',
  COMMERCE: 'Commerce',
  WORKSPACE: 'Workspace',
};

/**
 * Flat nav list with `group` for section rendering.
 * Staff: hide Team / Settings / Billing.
 * When subscription.limits is present, hide Promotions / Reports by entitlement.
 */
export function buildOwnerNavLinks({ role, venueId, venueCount = 0, subscription } = {}) {
  const isStaff = role === 'STAFF';
  const selectedVenueId = venueId && venueId !== 'new' ? venueId : '';
  const limits = subscription?.limits;
  const promotionsOk = !limits || limits.promotionsEnabled !== false;
  const reportsOk = !limits || limits.reportsEnabled !== false;

  const calendarTo = selectedVenueId
    ? `/owner/venues/${selectedVenueId}/calendar`
    : '/owner/calendar';

  const links = [
    { to: '/owner', label: 'Dashboard', end: true, group: GROUP.OVERVIEW },
    { to: '/owner/venues', label: 'Venues', end: true, group: GROUP.OPERATIONS },
    { to: '/owner/courts', label: 'Courts', group: GROUP.OPERATIONS },
    { to: '/owner/sports', label: 'Sports', group: GROUP.OPERATIONS },
    { to: '/owner/bookings', label: 'Bookings', group: GROUP.OPERATIONS },
    { to: calendarTo, label: 'Calendar', group: GROUP.OPERATIONS },
    { to: '/owner/walk-in', label: 'Walk-in', group: GROUP.OPERATIONS },
    { to: '/owner/availability', label: 'Availability', group: GROUP.OPERATIONS },
    { to: '/owner/blocked-slots', label: 'Blocked slots', group: GROUP.OPERATIONS },
    { to: '/owner/maintenance', label: 'Maintenance', group: GROUP.OPERATIONS },
    { to: '/owner/pricing', label: 'Pricing', group: GROUP.COMMERCE },
  ];

  if (promotionsOk) {
    links.push({ to: '/owner/promotions', label: 'Promotions', group: GROUP.COMMERCE });
  }

  links.push(
    { to: '/owner/customers', label: 'Customers', group: GROUP.COMMERCE },
    { to: '/owner/payments', label: 'Payments', group: GROUP.COMMERCE },
    { to: '/owner/refunds', label: 'Refunds', group: GROUP.COMMERCE },
  );

  if (reportsOk) {
    links.push({ to: '/owner/reports', label: 'Reports', group: GROUP.COMMERCE });
  }

  links.push({ to: '/owner/earnings', label: 'Earnings', group: GROUP.COMMERCE });

  links.push({ to: '/owner/reviews', label: 'Reviews', group: GROUP.WORKSPACE });

  if (!isStaff) {
    links.push(
      { to: '/owner/team', label: 'Staff', group: GROUP.WORKSPACE },
      { to: '/owner/settings', label: 'Settings', group: GROUP.WORKSPACE },
      { to: '/owner/billing', label: 'Billing', group: GROUP.WORKSPACE },
    );
  }

  if (!isStaff && venueCount === 0) {
    links.splice(2, 0, {
      to: '/owner/venues/new',
      label: 'Create venue',
      group: GROUP.OPERATIONS,
    });
  }

  return links;
}

export function ownerNavHint({ role, venueId, venueCount = 0 }) {
  const selectedVenueId = venueId && venueId !== 'new' ? venueId : '';
  if (selectedVenueId) return '';
  if (venueCount > 0) return 'Choose a venue above to open its calendar.';
  if (role === 'STAFF') return 'No venue is available in this workspace yet.';
  return '';
}

export function ownerPageTitle(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/owner';
  if (path === '/owner') return 'Dashboard';
  if (path === '/owner/venues') return 'Venues';
  if (path === '/owner/venues/new') return 'Create venue';
  if (path === '/owner/courts') return 'Courts';
  if (path === '/owner/sports') return 'Sports';
  if (path === '/owner/bookings' || /^\/owner\/bookings\//.test(path)) return 'Bookings';
  if (path === '/owner/calendar') return 'Calendar';
  if (path === '/owner/walk-in') return 'Walk-in';
  if (path === '/owner/availability') return 'Availability';
  if (path === '/owner/blocked-slots') return 'Blocked slots';
  if (path === '/owner/maintenance') return 'Maintenance';
  if (path === '/owner/pricing') return 'Pricing';
  if (path === '/owner/promotions') return 'Promotions';
  if (path === '/owner/customers') return 'Customers';
  if (path === '/owner/payments') return 'Payments';
  if (path === '/owner/refunds') return 'Refunds';
  if (path === '/owner/earnings') return 'Earnings';
  if (path === '/owner/reports' || path.startsWith('/owner/reports/')) return 'Reports';
  if (path === '/owner/team') return 'Staff';
  if (path === '/owner/settings') return 'Settings';
  if (path === '/owner/reviews') return 'Reviews';
  if (path === '/owner/billing' || path.startsWith('/owner/billing/')) return 'Billing';
  if (path === '/owner/profile') return 'Business profile';
  if (/\/owner\/venues\/[^/]+\/edit$/.test(path)) return 'Edit venue';
  if (/\/owner\/venues\/[^/]+\/calendar$/.test(path)) return 'Calendar';
  if (/\/owner\/venues\/[^/]+\/courts$/.test(path)) return 'Courts';
  if (/\/owner\/venues\/[^/]+\/booking-policy$/.test(path)) return 'Booking policy';
  return 'Owner dashboard';
}

export const OWNER_NAV_GROUPS = [
  GROUP.OVERVIEW,
  GROUP.OPERATIONS,
  GROUP.COMMERCE,
  GROUP.WORKSPACE,
];

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
