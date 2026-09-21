import apiClient from '../lib/axios';
import { unwrapApiData } from '../utils/apiData';
import { PAYMENT_GATEWAY } from '../utils/paymentGateway';

export const initiatePayment = (bookingId, gateway = PAYMENT_GATEWAY) =>
  apiClient
    .post(`/customer/payments/initiate/${bookingId}`, null, { params: { gateway } })
    .then((r) => unwrapApiData(r.data));

export const getPaymentStatus = (bookingId) =>
  apiClient.get(`/customer/payments/${bookingId}`).then((r) => unwrapApiData(r.data));

export const getInvoice = (bookingId) =>
  apiClient.get(`/customer/payments/invoice/${bookingId}`).then((r) => unwrapApiData(r.data));

export const downloadInvoicePdf = (bookingId) =>
  apiClient
    .get(`/customer/payments/invoice/${bookingId}/pdf`, { responseType: 'blob' })
    .then((r) => r.data);
