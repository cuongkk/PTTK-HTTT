import { apiClient } from "../apiClient";

export interface RecentRegistration {
  applicationId: string;
  customerName: string;
  desiredRoomType: string;
  desiredArea: string;
  minPrice: number | null;
  maxPrice: number | null;
  createdAt: string;
  status: string;
}

export interface UpcomingAppointment {
  scheduleId: string;
  customerName: string;
  roomName: string;
  branchName: string;
  appointmentAt: string;
  type: string;
}

export interface PendingTask {
  text: string;
  urgent: boolean;
}

export interface SalesDashboardData {
  vacantRoomsCount: number;
  newApplicationsTodayCount: number;
  pendingDepositsCount: number;
  todayAppointmentsCount: number;
  recentRegistrations: RecentRegistration[];
  upcomingAppointments: UpcomingAppointment[];
  pendingTasks: PendingTask[];
}

export interface SalesTenantMember {
  fullName: string;
  gender: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  nationalId: string | null;
  documentType: string | null;
  documentImageUrl: string | null;
  permanentAddress: string | null;
  occupationOrSchool: string | null;
  isPrimaryTenant: boolean;
  isEligible: boolean;
  note: string | null;
}

export interface SalesApplication {
  applicationId: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  area: string;
  capacity: number;
  priceRange: string;
  roomName: string;
  roomId: string | null;
  scheduleId: string | null;
  appointmentAt: string | null;
  appointmentSent: boolean;
  status: string;
  createdAt: string;
  note: string;
  hasContract: boolean;
  tenants?: SalesTenantMember[] | null;
  desiredRoomType: string | null;
  expectedMoveInDate: string | null;
  expectedRentalMonths: number | null;
  livingSchedule: string | null;
  requiresQuietLifestyle: boolean;
  requiresParking: boolean;
  requiresAirConditioner: boolean;
  minimumPrice: number | null;
  maximumPrice: number | null;
  scheduleStatus: string | null;
}

export interface SalesDepositSlip {
  depositId: string;
  applicationId: string;
  customerName: string;
  phoneNumber: string;
  roomName: string;
  area: string;
  depositAmount: number;
  holdUntil: string;
  status: string;
  createdAt: string;
  refundReason?: string | null;
  hasContract: boolean;
  applicationStatus: string | null;
  hasPaymentProof: boolean;
  paidAt: string | null;
  refundRequestedAt: string | null;
  roomStatus: string | null;
}

export interface SalesRentalContract {
  contractId: string;
  customerName: string;
  phoneNumber: string;
  roomName: string;
  moveInDate: string;
  durationMonths: number;
  monthlyRent: number;
  services: string[];
  paymentCycle: string;
  depositRef: string;
  status: string;
  createdAt: string;
  checkoutRequest: {
    requestedCheckoutAt: string;
    expectedDate: string;
    note: string;
    status: string;
  } | null;
}

export const salesApi = {
  getDashboard: () => apiClient.get<SalesDashboardData>("/sales/dashboard"),
  getApplications: () => apiClient.get<SalesApplication[]>("/sales/applications"),

  createSchedule: (applicationId: string, data: {
    roomId: string;
    appointmentAt: string;
    note: string;
  }) => apiClient.post<SalesApplication>(`/sales/applications/${applicationId}/schedules`, data),

  completeSchedule: (scheduleId: string) => apiClient.post<void>(`/sales/schedules/${scheduleId}/complete`, {}),
  cancelSchedule: (scheduleId: string) => apiClient.post<void>(`/sales/schedules/${scheduleId}/cancel`, {}),
  cancelApplication: (applicationId: string, reason: string) => apiClient.post<void>(`/sales/applications/${applicationId}/cancel`, { reason }),
  createDepositSlip: (data: {
    applicationId: string;
    roomId: string;
    depositAmount: number;
    holdUntil: string;
  }) => apiClient.post<SalesDepositSlip>("/sales/deposit-slips", data),

  getDepositSlips: () => apiClient.get<SalesDepositSlip[]>("/sales/deposit-slips"),
  expireDepositSlip: (depositId: string, reason: string) => apiClient.post<void>(`/sales/deposit-slips/${depositId}/expire`, { reason }),
  cancelDepositSlip: (depositId: string, reason: string) => apiClient.post<void>(`/sales/deposit-slips/${depositId}/cancel`, { reason }),

  getContracts: () => apiClient.get<SalesRentalContract[]>("/sales/contracts"),

  createRentalContract: (data: {
    depositId: string;
    roomId: string;
    moveInDate: string;
    durationMonths: number;
    monthlyRent: number;
    paymentCycle: string;
    services: string[];
  }) => apiClient.post<SalesRentalContract>("/sales/contracts", data),

  checkoutContract: (contractId: string, data: {
    expectedDate: string;
    note: string;
  }) => apiClient.post<void>(`/sales/contracts/${contractId}/checkout`, data),

  reviewDeposit: (applicationId: string) => apiClient.post<void>(`/sales/applications/${applicationId}/review-deposit`, {}),
  reviewCheckin: (applicationId: string) => apiClient.post<void>(`/sales/applications/${applicationId}/review-checkin`, {}),
  acceptDepositRefund: (depositId: string) => apiClient.post<void>(`/sales/deposit-slips/${depositId}/accept-refund`, {}),
};
