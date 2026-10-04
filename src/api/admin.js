import apiClient from '../lib/axios';
import { unwrapApiData } from '../utils/apiData';

const data = (request) => request.then((response) => unwrapApiData(response.data));
export const adminLogin = (payload) => data(apiClient.post('/admin/auth/login', payload));
export const adminLogout = (refreshToken) => data(apiClient.post('/admin/auth/logout', { refreshToken }, { skipAuthRefresh: true }));
export const getAdminDashboard = () => data(apiClient.get('/admin/dashboard'));
export const getAdminBusinesses = (params) => data(apiClient.get('/admin/businesses', { params }));
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
