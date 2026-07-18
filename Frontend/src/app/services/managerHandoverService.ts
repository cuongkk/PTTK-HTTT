import { apiClient } from "./apiClient";

export type ManagerHandoverAsset = { assetId: string; assetName: string; quantity: number; condition: string; note: string | null };
export type ManagerHandoverContract = { contractId: string; roomId: string; roomName: string; customerName: string; startDate: string; assets: ManagerHandoverAsset[] };

export const managerHandoverService = {
  getPending: () => apiClient.get<ManagerHandoverContract[]>("/manager/handovers/pending"),
  create: (request: { contractId: string; roomCondition: string; initialElectricityReading?: number; initialWaterReading?: number; note?: string; assets: ManagerHandoverAsset[] }) =>
    apiClient.post<{ handoverId: string }>("/manager/handovers", request),
};
