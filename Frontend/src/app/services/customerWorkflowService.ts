import { apiClient } from "./apiClient";

export interface InitialRentalInformation {
  fullName: string;
  phone: string;
  email: string | null;
  nationality: string | null;
  documentType: string | null;
  documentNumber: string | null;
  documentImageUrl: string | null;
  dateOfBirth: string | null;
  permanentAddress: string | null;
  occupationOrSchool: string | null;
  financialDocumentUrl: string | null;
  numberOfPeople: number;
  gender: string | null;
  desiredArea: string | null;
  roomType: string | null;
  minimumPrice: number | null;
  maximumPrice: number | null;
  expectedMoveInDate: string | null;
  expectedRentalMonths: number | null;
  livingSchedule: string | null;
  requiresQuietLifestyle: boolean;
  requiresParking: boolean;
  requiresAirConditioner: boolean;
  otherRequirements: string | null;
}

export interface ViewedRoom {
  applicationId: string;
  scheduleId: string;
  roomId: string;
  roomName: string;
  bedId: string | null;
  bedNumber: number | null;
  branchName: string;
  roomType: string;
  monthlyRent: number;
  viewedAt: string;
  viewingStatus: string;
  applicationStatus: string;
  applicant: InitialRentalInformation;
}

export interface DepositRequestDetail {
  viewedRoom: ViewedRoom;
  estimatedDepositAmount: number;
  depositFormula: string;
  paymentDueDescription: string;
}

export interface CustomerRoomSummary {
  roomId: string;
  roomName: string;
  bedId: string | null;
  bedNumber: number | null;
  branchName: string;
  monthlyRent: number;
  relevantAt: string;
  referenceId: string;
  status: string;
  applicationStatus: string;
}

export interface CustomerContractDetail { roomId: string; roomName: string; branchName: string; roomType: string; monthlyRent: number; numberOfBeds: number; startDate: string; endDate: string | null; contractStatus: string; customerName: string; applicationStatus: string; invoiceStatus: string | null; amountDue: number | null; }
export interface CustomerCheckoutDetail { roomId: string; roomName: string; contractId: string; contractStatus: string; requestStatus: string | null; requestedCheckoutAt: string | null; confirmedInspectionAt: string | null; reason: string | null; checkoutReportId: string | null; roomCondition: string | null; finalElectricityReading: number | null; finalWaterReading: number | null; keysReturned: boolean | null; reconciliationId: string | null; reconciliationDate: string | null; reconciliationStatus: string | null; refundRate: number | null; originalDeposit: number | null; baseRefund: number | null; totalDeductions: number | null; refundAmount: number | null; additionalPaymentAmount: number | null; invoiceStatus: string | null; costs: Array<{ costType: string; description: string; amount: number }>; }
export interface CustomerHandoverDetail { handoverId: string; contractId: string; roomId: string; roomName: string; handoverDate: string; managerName: string; roomCondition: string | null; initialElectricityReading: number | null; initialWaterReading: number | null; note: string | null; assets: Array<{ assetId: string; assetName: string; quantity: number; condition: string; note: string | null }>; }
export interface CustomerRoomContext { roomId: string; roomName: string; branchName: string; roomType: string; monthlyRent: number; roomStatus: string; customerName: string; phone: string; email: string | null; nationalId: string | null; gender: string | null; nationality: string | null; dateOfBirth: string | null; address: string | null; applicationId: string | null; applicationStatus: string | null; numberOfPeople: number | null; expectedMoveInDate: string | null; expectedRentalMonths: number | null; depositId: string | null; depositStatus: string | null; depositAmount: number | null; contractId: string | null; contractStatus: string | null; invoiceId: string | null; invoiceStatus: string | null; invoiceAmount: number | null; tenants: Array<{ fullName: string; gender: string | null; nationality: string | null; dateOfBirth: string | null; nationalId: string | null; documentImageUrl: string | null; permanentAddress: string | null; occupationOrSchool: string | null; }>; }
export interface CustomerPayment { invoiceId: string; invoiceIds: string[]; paymentType: string; roomId: string; roomName: string; amount: number; createdAt: string; paidAt: string | null; status: string; paymentMethod: string; bankName: string | null; bankAccountNumber: string | null; bankAccountHolder: string | null; transferContent: string; proofImageUrl: string | null; }
export interface CustomerServiceItem { serviceId: string; serviceName: string; unit: string; unitPrice: number; description: string | null; }

export const customerWorkflowService = {
  createRentalApplication: (request: {
    roomId?: string; fullName?: string; phone?: string; email?: string; numberOfPeople: number; gender?: string;
    nationality?: string; documentType?: string; documentNumber?: string; documentImageUrl?: string;
    dateOfBirth?: string; permanentAddress?: string; financialDocumentUrl?: string; expectedMoveInDate: string;
    expectedRentalMonths: number; livingSchedule?: string; requiresQuietLifestyle: boolean; requiresParking: boolean;
    requiresAirConditioner: boolean; otherRequirements?: string; desiredArea?: string; desiredRoomType?: string;
    minimumPrice?: number; maximumPrice?: number;
  }) => apiClient.post<{ applicationId: string; status: string; message: string }>("/customer-workflow/rental-applications", request),
  getViewedRooms: () => apiClient.get<ViewedRoom[]>("/customer-workflow/viewed-rooms"),
  getAvailableServices: (roomId?: string) => apiClient.get<CustomerServiceItem[]>(`/customer-workflow/services${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`),
  confirmRoomInformationViewed: (scheduleId: string) => apiClient.post<void>(`/customer-workflow/viewing-schedules/${scheduleId}/confirm-room-information`, {}),
  getDepositedRooms: () => apiClient.get<CustomerRoomSummary[]>("/customer-workflow/deposited-rooms"),
  getRentingRooms: () => apiClient.get<CustomerRoomSummary[]>("/customer-workflow/renting-rooms"),
  confirmRentalContract: (roomId: string) => apiClient.post<void>(`/customer-workflow/rooms/${roomId}/contract/confirm`, {}),
  submitCheckoutRequest: (roomId: string, expectedCheckoutDate: string, reason: string) => apiClient.post<void>(`/customer-workflow/rooms/${roomId}/checkout-request`, { expectedCheckoutDate, reason }),
  submitCheckInProfile: (roomId: string) => apiClient.post<void>(`/customer-workflow/rooms/${roomId}/check-in-profile`, {}),
  getDepositRequest: (applicationId: string, roomId: string) => apiClient.get<DepositRequestDetail>(`/customer-workflow/applications/${applicationId}/rooms/${roomId}/deposit-request`),
  submitDepositRequest: (applicationId: string, roomId: string) => apiClient.post<{ applicationId: string; status: string; message: string }>(`/customer-workflow/applications/${applicationId}/rooms/${roomId}/deposit-request`, {}),
  getDepositTerms: (applicationId: string, roomId: string) => apiClient.get<ViewedRoom>(`/customer-workflow/applications/${applicationId}/rooms/${roomId}/deposit-terms`),
  confirmDepositTerms: (applicationId: string, roomId: string) => apiClient.post<{ applicationId: string; status: string; message: string }>(`/customer-workflow/applications/${applicationId}/rooms/${roomId}/deposit-terms/confirm`, {}),
  submitDepositRefund: (roomId: string, reason: string) => apiClient.post<{ depositId: string; status: string; message: string }>(`/customer-workflow/rooms/${roomId}/deposit-refund`, { reason }),
  confirmDepositRefund: (roomId: string) => apiClient.post<void>(`/customer-workflow/rooms/${roomId}/deposit-refund/confirm`, {}),
  getContractDetail: (roomId: string) => apiClient.get<CustomerContractDetail>(`/customer-workflow/rooms/${roomId}/contract`),
  getCheckoutDetail: (roomId: string) => apiClient.get<CustomerCheckoutDetail>(`/customer-workflow/rooms/${roomId}/checkout`),
  confirmCheckoutReconciliation: (roomId: string, signerName: string) => apiClient.post<void>(`/customer-workflow/rooms/${roomId}/checkout/confirm`, { signerName }),
  getHandoverDetail: (roomId: string) => apiClient.get<CustomerHandoverDetail>(`/customer-workflow/rooms/${roomId}/handover`),
  confirmHandover: (roomId: string) => apiClient.post<void>(`/customer-workflow/rooms/${roomId}/handover/confirm`, {}),
  getRoomContext: (roomId: string) => apiClient.get<CustomerRoomContext>(`/customer-workflow/rooms/${roomId}/context`),
  getPayments: () => apiClient.get<CustomerPayment[]>("/customer-workflow/payments"),
  confirmPayment: (invoiceId: string) => apiClient.post<void>(`/customer-workflow/payments/${invoiceId}/confirm`, {}),
};
