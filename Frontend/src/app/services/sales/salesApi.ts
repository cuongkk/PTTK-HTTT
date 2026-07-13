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
}

export interface SalesDepositSlip {
  depositId: string;
  customerName: string;
  phoneNumber: string;
  roomName: string;
  area: string;
  depositAmount: number;
  holdUntil: string;
  status: string;
  createdAt: string;
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
  } | null;
}

export const salesApi = {
  getDashboard: () => apiClient.get<SalesDashboardData>("/sales/dashboard"),
  getApplications: () => apiClient.get<SalesApplication[]>("/sales/applications"),
  createApplication: (data: {
    name: string;
    phone: string;
    email: string;
    gender?: string;
    genderRequirement?: string;
    area?: string;
    capacity?: number;
    priceRange?: string;
    note: string;
  }) => apiClient.post<SalesApplication>("/sales/applications", data),



  createSchedule: (applicationId: string, data: {
    roomId: string;
    appointmentAt: string;
    note: string;
  }) => apiClient.post<SalesApplication>(`/sales/applications/${applicationId}/schedules`, data),

  completeSchedule: (scheduleId: string) => apiClient.post<void>(`/sales/schedules/${scheduleId}/complete`, {}),

  createDepositSlip: (data: {
    applicationId: string;
    roomId: string;
    depositAmount: number;
    holdUntil: string;
  }) => apiClient.post<SalesDepositSlip>("/sales/deposit-slips", data),

  getDepositSlips: () => apiClient.get<SalesDepositSlip[]>("/sales/deposit-slips"),

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
};
