import apiClient from '../lib/axios';
import { unwrapApiData } from '../utils/apiData';

const data = (request) => request.then((response) => unwrapApiData(response.data));
export const adminLogin = (payload) => data(apiClient.post('/admin/auth/login', payload));
export const adminLogout = (refreshToken) => data(apiClient.post('/admin/auth/logout', { refreshToken }, { skipAuthRefresh: true }));
export const getAdminDashboard = () => data(apiClient.get('/admin/dashboard'));
export const getAdminBusinesses = (params) => data(apiClient.get('/admin/businesses', { params }));
/** Admin provisions owner + business + trial. Body includes temporaryPassword; response echoes it once. */
export const createAdminBusiness = (payload) => data(apiClient.post('/admin/businesses', payload));
export const setBusinessAccess = (id, params) => data(apiClient.patch(`/admin/businesses/${id}/access`, null, { params }));
export const setBusinessCommission = (id, params) => data(apiClient.patch(`/admin/businesses/${id}/commission`, null, { params }));
/** Admin override: extend trial or force a plan. Body: { planCode?, status?, trialEndsAt?, reason } */
export const setBusinessSubscription = (id, payload) => data(apiClient.patch(`/admin/businesses/${id}/subscription`, payload));
/** Catalog + limits for all plans including TRIAL. */
export const getAdminSubscriptionPlans = () => data(apiClient.get('/admin/subscription-plans'));
/** Body: AdminSubscriptionPlanUpdateRequest (reason required). */
export const updateAdminSubscriptionPlan = (code, payload) => data(apiClient.put(`/admin/subscription-plans/${code}`, payload));
export const getAdminVenues = (params) => data(apiClient.get('/admin/venues', { params }));
export const setAdminVenueStatus = (id, params) => data(apiClient.patch(`/admin/venues/${id}/status`, null, { params }));
export const getAdminCustomers = (params) => data(apiClient.get('/admin/customers', { params }));
/** CSV download of all non-deleted registered customers. */
export const exportAdminCustomers = () =>
  apiClient
    .get('/admin/customers/export', { responseType: 'blob' })
    .then((response) => response.data);
/** Broadcast marketing SMS and/or email to ACTIVE customers. */
export const sendAdminMarketing = (payload) => data(apiClient.post('/admin/customers/marketing', payload));
export const getAdminAudit = (params) => data(apiClient.get('/admin/audit', { params }));
export const getHomepageDraft = () => data(apiClient.get('/admin/homepage'));
export const saveHomepageDraft = (payload) => data(apiClient.put('/admin/homepage/draft', payload));
export const publishHomepage = (reason) => data(apiClient.post('/admin/homepage/publish', null, { params: { reason } }));
export const getHomepageVersions = () => data(apiClient.get('/admin/homepage/versions'));
export const restoreHomepageVersion = (id, reason) => data(apiClient.post(`/admin/homepage/versions/${id}/restore`, null, { params: { reason } }));
export const uploadPremiumSlideImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  // Let the browser set multipart boundary (do not force Content-Type).
  return data(apiClient.post('/admin/homepage/slides/image', form, {
    headers: { 'Content-Type': undefined },
  }));
};

export const getAdminPayoutBusinesses = () => data(apiClient.get('/admin/payouts/businesses'));
export const getAdminPayouts = (params) => data(apiClient.get('/admin/payouts', { params }));
export const getAdminPayout = (id) => data(apiClient.get(`/admin/payouts/${id}`));
export const updateAdminPayoutStatus = (id, payload) => data(apiClient.patch(`/admin/payouts/${id}/status`, payload));
export const settleAdminPayout = (id, { transferReference, transferDate, transferAmount, note, overrideReason, receipt }) => {
  if (receipt) {
    const form = new FormData();
    form.append('transferReference', transferReference);
    form.append('transferDate', transferDate);
    form.append('transferAmount', String(transferAmount));
    if (note) form.append('note', note);
    if (overrideReason) form.append('overrideReason', overrideReason);
    form.append('receipt', receipt);
    return data(apiClient.post(`/admin/payouts/${id}/settle`, form, {
      headers: { 'Content-Type': undefined },
    }));
  }
  return data(apiClient.post(`/admin/payouts/${id}/settle`, {
    transferReference,
    transferDate,
    transferAmount,
    note,
    overrideReason,
  }));
};
export const generateAdminPayouts = (asOf) => data(apiClient.post('/admin/payouts/generate', null, {
  params: asOf ? { asOf } : undefined,
}));
export const setBusinessBankVerification = (id, payload) => data(apiClient.patch(`/admin/businesses/${id}/bank-verification`, payload));
export const getAdminPayoutConfig = () => data(apiClient.get('/admin/payout-config'));
export const updateAdminPayoutConfig = (payload) => data(apiClient.patch('/admin/payout-config', payload));
