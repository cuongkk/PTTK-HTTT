import { apiClient } from "../apiClient";

export interface Bed {
  bedId: string;
  roomId: string;
  bedNumber: number;
  monthlyRent: number;
  status: string;
}

export interface Room {
  roomId: string;
  branchId: string;
  branchName: string;
  roomName: string;
  roomType: string;
  capacity: number;
  area: string | null;
  roomPrice: number | null;
  floor: number | null;
  areaSquareMeters: number | null;
  description: string | null;
  allowedGender: string | null;
  requiresQuietLifestyle: boolean;
  curfewTime: string | null;
  hasAirConditioner: boolean;
  hasParking: boolean;
  status: string;
  beds: Bed[];
  images: Array<{
    roomImageId: string;
    imageUrl: string;
    description: string | null;
    displayOrder: number;
    isPrimary: boolean;
  }>;
  amenities: Array<{
    amenityId: string;
    amenityName: string;
    quantity: number;
    note: string | null;
  }>;
}

export interface Branch {
  branchId: string;
  branchName: string;
  address: string;
  phoneNumber: string | null;
  email: string | null;
}

export interface CreateRoomRequest {
  branchId: string;
  roomName: string;
  roomType: string;
  capacity: number;
  area?: string;
  roomPrice?: number;
  floor?: number;
  areaSquareMeters?: number;
  description?: string;
  allowedGender?: string;
  requiresQuietLifestyle?: boolean;
  curfewTime?: string;
  hasAirConditioner: boolean;
  hasParking: boolean;
}

export interface UpdateRoomRequest {
  roomName: string;
  roomType: string;
  capacity: number;
  area?: string;
  roomPrice?: number;
  floor?: number;
  areaSquareMeters?: number;
  description?: string;
  allowedGender?: string;
  requiresQuietLifestyle?: boolean;
  curfewTime?: string;
  hasAirConditioner: boolean;
  hasParking: boolean;
  status: string;
}

export const roomService = {
  getAll: () => apiClient.get<Room[]>("/rooms"),
  getBranches: () => apiClient.get<Branch[]>("/rooms/branches"),
  create: (request: CreateRoomRequest) => apiClient.post<Room>("/rooms", request),
  update: (roomId: string, request: UpdateRoomRequest) => apiClient.put<Room>(`/rooms/${roomId}`, request),
  remove: (roomId: string) => apiClient.delete<void>(`/rooms/${roomId}`),
};
