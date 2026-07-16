import { apiClient } from "../apiClient";

export interface AdminDashboard {
  totalAccounts: number; activeAccounts: number; totalRoles: number; totalPermissions: number;
  totalRooms: number; emptyRooms: number; rentedRooms: number; totalBeds: number; emptyBeds: number;
  totalServices: number; activeServices: number; totalSystemParameters: number; activeResidenceRules: number;
}
export interface Permission { permissionId: string; permissionName: string; description?: string | null }
export interface RoleAccess { roleId: string; roleName: string; description?: string | null; accountCount: number; permissionIds: string[] }
export interface AccessMatrix { roles: RoleAccess[]; permissions: Permission[] }

export interface AdminResidenceRule {
  residenceRuleId: string; branchId: string; branchName: string; title: string; content: string;
  ruleType: string; violationLevel: string; defaultPenaltyAmount?: number | null;
  effectiveFrom: string; effectiveTo?: string | null; status: string;
}
export type SaveResidenceRule = Omit<AdminResidenceRule, "residenceRuleId" | "branchName">;
export interface AdminAmenity { amenityId: string; amenityName: string; description?: string | null; isActive: boolean; roomCount: number }
export interface RoomAmenity { roomId: string; roomName: string; amenityId: string; amenityName: string; quantity: number; note?: string | null }
export interface AdminRoomImage { roomImageId: string; roomId: string; roomName: string; imageUrl: string; description?: string | null; displayOrder: number; isPrimary: boolean }
export interface AdminServiceRate { serviceRateId: string; serviceId: string; serviceName: string; scopeType: "chi_nhanh" | "phong"; targetId: string; targetName: string; unitPrice: number; isActive: boolean }

export const systemAdminService = {
  getDashboard: () => apiClient.get<AdminDashboard>("/system-admin/dashboard"),
  getAccessMatrix: () => apiClient.get<AccessMatrix>("/system-admin/access-matrix"),
  updateRolePermissions: (roleId: string, permissionIds: string[]) => apiClient.put<RoleAccess>(`/system-admin/roles/${roleId}/permissions`, { permissionIds }),

  getResidenceRules: () => apiClient.get<AdminResidenceRule[]>("/system-admin/residence-rules"),
  createResidenceRule: (data: SaveResidenceRule) => apiClient.post<AdminResidenceRule>("/system-admin/residence-rules", data),
  updateResidenceRule: (id: string, data: SaveResidenceRule) => apiClient.put<AdminResidenceRule>(`/system-admin/residence-rules/${id}`, data),

  getAmenities: () => apiClient.get<AdminAmenity[]>("/system-admin/amenities"),
  createAmenity: (data: { amenityName: string; description?: string; isActive: boolean }) => apiClient.post<AdminAmenity>("/system-admin/amenities", data),
  updateAmenity: (id: string, data: { amenityName: string; description?: string; isActive: boolean }) => apiClient.put<AdminAmenity>(`/system-admin/amenities/${id}`, data),
  getRoomAmenities: (roomId: string) => apiClient.get<RoomAmenity[]>(`/system-admin/rooms/${roomId}/amenities`),
  saveRoomAmenity: (roomId: string, data: { amenityId: string; quantity: number; note?: string }) => apiClient.put<void>(`/system-admin/rooms/${roomId}/amenities`, data),
  removeRoomAmenity: (roomId: string, amenityId: string) => apiClient.delete<void>(`/system-admin/rooms/${roomId}/amenities/${amenityId}`),

  getRoomImages: (roomId?: string) => apiClient.get<AdminRoomImage[]>(`/system-admin/room-images${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`),
  createRoomImage: (roomId: string, data: { imageUrl: string; description?: string; displayOrder: number; isPrimary: boolean }) => apiClient.post<AdminRoomImage>(`/system-admin/rooms/${roomId}/images`, data),
  updateRoomImage: (id: string, data: { imageUrl: string; description?: string; displayOrder: number; isPrimary: boolean }) => apiClient.put<AdminRoomImage>(`/system-admin/room-images/${id}`, data),
  deleteRoomImage: (id: string) => apiClient.delete<void>(`/system-admin/room-images/${id}`),

  getServiceRates: () => apiClient.get<AdminServiceRate[]>("/system-admin/service-rates"),
  createServiceRate: (data: { serviceId: string; scopeType: string; targetId: string; unitPrice: number; isActive: boolean }) => apiClient.post<AdminServiceRate>("/system-admin/service-rates", data),
  updateServiceRate: (id: string, data: { serviceId: string; scopeType: string; targetId: string; unitPrice: number; isActive: boolean }) => apiClient.put<AdminServiceRate>(`/system-admin/service-rates/${id}`, data),
  deleteServiceRate: (id: string) => apiClient.delete<void>(`/system-admin/service-rates/${id}`),
};
