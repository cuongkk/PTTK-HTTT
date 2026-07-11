import { apiClient } from "../apiClient";
import type { Bed } from "./roomService";

export interface CreateBedRequest {
  roomId: string;
  bedNumber: number;
  monthlyRent: number;
}

export interface UpdateBedRequest {
  bedNumber: number;
  monthlyRent: number;
  status: string;
}

export const bedService = {
  getByRoomId: (roomId: string) => apiClient.get<Bed[]>(`/beds?roomId=${encodeURIComponent(roomId)}`),
  create: (request: CreateBedRequest) => apiClient.post<Bed>("/beds", request),
  update: (bedId: string, request: UpdateBedRequest) => apiClient.put<Bed>(`/beds/${bedId}`, request),
  remove: (bedId: string) => apiClient.delete<void>(`/beds/${bedId}`),
};
