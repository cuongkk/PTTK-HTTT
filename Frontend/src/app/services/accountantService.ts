import { apiClient } from "./apiClient";

export interface ContractInvoiceInfo {
  id: string;
  contractId: string;
  customerName: string;
  roomName: string;
  monthlyRent: number;
  bedCount: number;
}

export interface CreateInvoiceRequest {
  customerId: string;
  depositId?: string;
  contractId?: string;
  reconciliationId?: string;
  invoiceType: string; // tien_coc, tien_thue, dich_vu, hoan_coc, thu_them
  totalAmount: number;
  dueDate?: string;
  billingCycle?: string;
  notes?: string;
}

export interface Invoice {
  invoiceId: string;
  customerId: string;
  customerName: string;
  roomName: string;
  invoiceType: string;
  documentType: "thu" | "chi";
  totalAmount: number;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  transactionId?: string;
  proofImage?: string;
  createdAt: string;
  paidAt?: string;
  status: string;
  dueDate?: string;
  notes?: string;
  billingCycle?: string;
}

export interface CheckInContract {
  id: string;
  contractId: string;
  customerName: string;
  roomName: string;
  moveInDate: string;
  endDate: string;
  bedCount: number;
  rentPrice: number;
  paymentCycle: string;
  depositAmount: number;
  firstMonthRent: number;
  serviceFee: number;
  isComplete: boolean;
}

export interface SaveCheckInChargesRequest {
  contractId: string;
  firstMonthRent: number;
  otherFees: number;
  notes?: string;
}

export interface ReconciliationListItem {
  reconciliationId: string;
  contractId: string;
  customerId: string;
  customerName: string;
  roomName: string;
  moveInDate: string;
  moveOutDate: string;
  deposit: number;
  monthlyRent: number;
  refundRate: number;
  baseRefundAmount: number;
  damages: number;
  unpaidUtilities: number;
  rentArrears: number;
  violationFines: number;
  otherDeductions: number;
  otherDeductionsNote?: string;
  refundAmount: number;
  status: string;
  refundMethod?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface SaveReconciliationDeductionsRequest {
  reconciliationId: string;
  damages: number;
  utilities: number;
  rentArrears: number;
  violationFines: number;
  otherDeductions: number;
  otherDeductionsNote?: string;
  notes?: string;
}

export interface ProcessRefundRequest {
  reconciliationId: string;
  method: "transfer" | "cash";
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export const accountantService = {
  // 1. Payment Requests
  getPendingContractsForInvoice: () =>
    apiClient.get<ContractInvoiceInfo[]>("/accountant/payment-requests/contracts"),
  
  createInvoiceRequest: (request: CreateInvoiceRequest) =>
    apiClient.post<void>("/accountant/payment-requests", request),
  
  getSentRequests: () =>
    apiClient.get<Invoice[]>("/accountant/payment-requests"),

  // 2. Payment Confirmations
  getPendingConfirmations: () =>
    apiClient.get<Invoice[]>("/accountant/payment-confirmations"),
  
  approvePayment: (invoiceId: string) =>
    apiClient.post<void>(`/accountant/payment-confirmations/${invoiceId}/approve`),
  
  rejectPayment: (invoiceId: string, reason: string) =>
    apiClient.post<void>(`/accountant/payment-confirmations/${invoiceId}/reject`, { reason }),

  // 3. Check-In Charges
  getPendingCheckInContracts: () =>
    apiClient.get<CheckInContract[]>("/accountant/check-in-charges/contracts"),
  
  saveCheckInCharges: (request: SaveCheckInChargesRequest) =>
    apiClient.post<void>("/accountant/check-in-charges", request),

  // 4. Reconciliations
  getReconciliations: () =>
    apiClient.get<ReconciliationListItem[]>("/accountant/reconciliations"),
  
  saveReconciliationDeductions: (request: SaveReconciliationDeductionsRequest) =>
    apiClient.post<void>("/accountant/reconciliations/deductions", request),
  
  processRefund: (request: ProcessRefundRequest) =>
    apiClient.post<void>("/accountant/reconciliations/refund", request),
};
