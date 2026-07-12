import { apiClient } from "../apiClient";

export const accountantApi = {
  getInvoices: () => apiClient.get<unknown[]>("/accountant/invoices"),
  getPendingPayments: () => apiClient.get<unknown[]>("/accountant/payments/pending"),
  getReconciliations: () => apiClient.get<unknown[]>("/accountant/reconciliations"),
  getRefunds: () => apiClient.get<unknown[]>("/accountant/refunds"),
};
