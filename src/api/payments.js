import apiClient from '../lib/axios';

/* ───────────────────────────────────────────────
   Payment endpoints  →  /api/v1/customer/payments/*
   Requires auth
─────────────────────────────────────────────── */

/**
 * Initiate a payment for a booking
 * POST /customer/payments/initiate/:bookingId?gateway=PAYHERE
 * @param {string} bookingId
 * @param {string} [gateway]
 */
export const initiatePayment = (bookingId, gateway = 'PAYHERE') =>
  apiClient
    .post(`/customer/payments/initiate/${bookingId}`, null, { params: { gateway } })
    .then((r) => r.data);

/**
 * Get payment status for a booking
 * GET /customer/payments/:bookingId
 * @param {string} bookingId
 */
export const getPaymentStatus = (bookingId) =>
  apiClient.get(`/customer/payments/${bookingId}`).then((r) => r.data);

/**
 * Get invoice details for a booking
 * GET /customer/payments/invoice/:bookingId
 * @param {string} bookingId
 */
export const getInvoice = (bookingId) =>
  apiClient.get(`/customer/payments/invoice/${bookingId}`).then((r) => r.data);

/**
 * Download invoice PDF
 * GET /customer/payments/invoice/:bookingId/pdf
 * @param {string} bookingId
 * @returns {Promise<Blob>}
 */
export const downloadInvoicePdf = (bookingId) =>
  apiClient
    .get(`/customer/payments/invoice/${bookingId}/pdf`, { responseType: 'blob' })
    .then((r) => r.data);
