import { apiClient } from "../apiClient";

export interface UserListItem {
  accountId: string;
  displayName: string;
  email: string | null;
  roleId: string;
  roleName: string;
  status: string;
  lastLoginAt: string | null;
  ownerType: "employee" | "customer";
}

export interface UserDetail {
  accountId: string;
  username: string;
  email: string | null;
  roleId: string;
  roleName: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  ownerType: "employee" | "customer";
  employeeId: string | null;
  customerId: string | null;
  fullName: string;
  phoneNumber: string | null;
  // Nhân viên
  branchId: string | null;
  branchName: string | null;
  hireDate: string | null;
  // Khách hàng
  nationalId: string | null;
  gender: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  address: string | null;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  roleId: string;
  password: string;
  phoneNumber?: string;
  branchId?: string;
  nationalId?: string;
  gender?: string;
  nationality?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
  roleId: string;
  status: string;
  password?: string;
  branchId?: string;
  hireDate?: string;
  nationalId?: string;
  gender?: string;
  nationality?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface ResetPasswordResponse {
  newPassword: string;
}

export const userService = {
  getAll: () => apiClient.get<UserListItem[]>("/users"),
  getById: (accountId: string) => apiClient.get<UserDetail>(`/users/${accountId}`),
  create: (request: CreateUserRequest) => apiClient.post<UserListItem>("/users", request),
  update: (accountId: string, request: UpdateUserRequest) =>
    apiClient.put<UserListItem>(`/users/${accountId}`, request),
  resetPassword: (accountId: string) =>
    apiClient.post<ResetPasswordResponse>(`/users/${accountId}/reset-password`),
};
