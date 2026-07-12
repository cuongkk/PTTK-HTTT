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

export interface SubmitDepositRequest {
  primaryTenant: {
    gender: string; nationality: string;
  };
  accompanyingTenants: Array<{ fullName: string; gender: string; nationality: string }>;
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

export const customerWorkflowService = {
  getViewedRooms: () => apiClient.get<ViewedRoom[]>("/customer-workflow/viewed-rooms"),
  getDepositedRooms: () => apiClient.get<CustomerRoomSummary[]>("/customer-workflow/deposited-rooms"),
  getRentingRooms: () => apiClient.get<CustomerRoomSummary[]>("/customer-workflow/renting-rooms"),
  getDepositRequest: (applicationId: string, roomId: string) => apiClient.get<DepositRequestDetail>(`/customer-workflow/applications/${applicationId}/rooms/${roomId}/deposit-request`),
  submitDepositRequest: (applicationId: string, roomId: string, request: SubmitDepositRequest) => apiClient.post<{ applicationId: string; status: string; message: string }>(`/customer-workflow/applications/${applicationId}/rooms/${roomId}/deposit-request`, request),
};
