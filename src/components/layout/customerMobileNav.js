/** Paths where the mobile bottom tab bar should be hidden (focused flows). */
export function isFocusedCustomerFlow(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/checkout' || path.startsWith('/checkout/')) return true;
  if (path === '/payment/return' || path.startsWith('/payment/')) return true;
  if (/^\/venues\/[^/]+\/slots$/.test(path)) return true;
  if (/^\/bookings\/[^/]+$/.test(path)) return true;
  return false;
}

export const CUSTOMER_BOTTOM_TABS = [
  { id: 'home', label: 'Home', to: '/', match: 'home' },
  { id: 'explore', label: 'Explore', to: '/#venues', match: 'explore' },
  { id: 'bookings', label: 'Bookings', to: '/account/bookings', match: 'bookings', requiresAuth: true },
  { id: 'favorites', label: 'Favorites', to: '/account/favourites', match: 'favorites', requiresAuth: true },
  { id: 'profile', label: 'Profile', to: '/account/profile', match: 'profile', requiresAuth: true },
];

export function isCustomerTabActive(match, { pathname = '', hash = '' } = {}) {
  const path = pathname.replace(/\/$/, '') || '/';
  switch (match) {
    case 'home':
      return path === '/' && hash !== '#venues' && hash !== '#sports';
    case 'explore':
      return path === '/' && (hash === '#venues' || hash === '#sports');
    case 'bookings':
      return path === '/account' || path === '/account/bookings' || path.startsWith('/bookings/');
    case 'favorites':
      return path === '/account/favourites';
    case 'profile':
      return path === '/account/profile';
    default:
      return false;
  }
}

export function customerAuthRedirect(to) {
  return {
    pathname: '/auth/login',
    state: { from: to },
  };
}

export const CUSTOMER_DRAWER_GROUPS = [
  {
    id: 'discover',
    label: 'Discover',
    items: [
      { label: 'Home', to: '/', icon: 'home' },
      { label: 'Explore venues', to: '/#venues', icon: 'compass' },
      { label: 'Sports', to: '/#sports', icon: 'trophy' },
      { label: 'My bookings', to: '/account/bookings', icon: 'calendar', requiresAuth: true },
    ],
  },
  {
    id: 'account',
    label: 'My Account',
    items: [
      { label: 'Profile', to: '/account/profile', icon: 'user', requiresAuth: true },
      { label: 'Favourites', to: '/account/favourites', icon: 'heart', requiresAuth: true },
      { label: 'History', to: '/account/history', icon: 'history', requiresAuth: true },
      { label: 'Help', to: '/account/help', icon: 'help', requiresAuth: true },
      { label: 'Privacy', to: '/account/privacy', icon: 'shield', requiresAuth: true },
    ],
  },
];

export function isDrawerLinkActive(to, { pathname = '', hash = '' } = {}) {
  if (to.includes('#')) {
    const [pathPart, hashPart] = to.split('#');
    const base = (pathPart || '/').replace(/\/$/, '') || '/';
    const path = pathname.replace(/\/$/, '') || '/';
    return path === base && hash === `#${hashPart}`;
  }
  const path = pathname.replace(/\/$/, '') || '/';
  const target = to.replace(/\/$/, '') || '/';
  if (target === '/account/bookings') {
    return path === '/account' || path === '/account/bookings';
  }
  return path === target;
}
