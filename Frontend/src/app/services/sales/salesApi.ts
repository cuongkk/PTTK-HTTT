import { apiClient } from "../apiClient";

export const salesApi = {
  getApplications: () => apiClient.get<unknown[]>("/sales/applications"),
  getViewingSchedules: () => apiClient.get<unknown[]>("/sales/viewing-schedules"),
  getDepositSlips: () => apiClient.get<unknown[]>("/sales/deposit-slips"),
  getContracts: () => apiClient.get<unknown[]>("/sales/contracts"),
};
