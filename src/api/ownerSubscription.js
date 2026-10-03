import apiClient from '../lib/axios';

/**
 * Owner platform subscription API.
 *
 * Contract (backend):
 * - GET  /owner/subscription              → current business subscription
 * - GET  /owner/subscription/plans        → paid plan catalog
 * - POST /owner/subscription/checkout     → { planCode, billingInterval } → { paymentId, paymentUrl, status }
 * - GET  /owner/subscription/payments/:id → payment status poll
 *
 * On POST /owner/auth/register the backend must auto-create a TRIAL subscription
 * (trialEndsAt = now + 90 days, status = TRIALING). No card required during trial.
 */

export const getSubscription = () => apiClient.get('/owner/subscription');

export const listSubscriptionPlans = () => apiClient.get('/owner/subscription/plans');

export const checkoutSubscription = (payload) =>
  apiClient.post('/owner/subscription/checkout', payload);

export const getSubscriptionPaymentStatus = (paymentId) =>
  apiClient.get(`/owner/subscription/payments/${paymentId}`);

export const ownerSubscriptionApi = {
  getSubscription,
  listSubscriptionPlans,
  checkoutSubscription,
  getSubscriptionPaymentStatus,
};

export default ownerSubscriptionApi;
