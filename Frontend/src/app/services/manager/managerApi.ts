import { apiClient } from "../apiClient";

export const managerApi = {
  getDepositReviews: () => apiClient.get<unknown[]>("/manager/deposit-reviews"),
  getRoomInspections: () => apiClient.get<unknown[]>("/manager/room-inspections"),
  getTenantVerifications: () => apiClient.get<unknown[]>("/manager/tenant-verifications"),
  getReconciliations: () => apiClient.get<unknown[]>("/manager/reconciliations"),
};
