import { describe, expect, it } from 'vitest';
import {
  isCustomerTabActive,
  isDrawerLinkActive,
  isFocusedCustomerFlow,
} from './customerMobileNav';

describe('customerMobileNav', () => {
  it('hides bottom nav on focused customer flows', () => {
    expect(isFocusedCustomerFlow('/checkout')).toBe(true);
    expect(isFocusedCustomerFlow('/checkout/abc')).toBe(true);
    expect(isFocusedCustomerFlow('/payment/return')).toBe(true);
    expect(isFocusedCustomerFlow('/venues/v1/slots')).toBe(true);
    expect(isFocusedCustomerFlow('/bookings/b1')).toBe(true);
    expect(isFocusedCustomerFlow('/')).toBe(false);
    expect(isFocusedCustomerFlow('/account/bookings')).toBe(false);
  });

  it('matches bottom tabs from pathname and hash', () => {
    expect(isCustomerTabActive('home', { pathname: '/', hash: '' })).toBe(true);
    expect(isCustomerTabActive('explore', { pathname: '/', hash: '#venues' })).toBe(true);
    expect(isCustomerTabActive('bookings', { pathname: '/account/bookings', hash: '' })).toBe(true);
    expect(isCustomerTabActive('bookings', { pathname: '/account', hash: '' })).toBe(true);
    expect(isCustomerTabActive('favorites', { pathname: '/account/favourites', hash: '' })).toBe(true);
    expect(isCustomerTabActive('profile', { pathname: '/account/profile', hash: '' })).toBe(true);
  });

  it('matches drawer links including hashes', () => {
    expect(isDrawerLinkActive('/#venues', { pathname: '/', hash: '#venues' })).toBe(true);
    expect(isDrawerLinkActive('/#sports', { pathname: '/', hash: '#sports' })).toBe(true);
    expect(isDrawerLinkActive('/account/bookings', { pathname: '/account', hash: '' })).toBe(true);
    expect(isDrawerLinkActive('/account/profile', { pathname: '/account/profile', hash: '' })).toBe(true);
  });
});
