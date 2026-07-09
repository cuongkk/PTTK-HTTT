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

export interface CreateUserRequest {
  fullName: string;
  email: string;
  roleId: string;
  phoneNumber?: string;
}

export interface CreateUserResponse {
  user: UserListItem;
  temporaryPassword: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
  roleId: string;
  status: string;
}

export interface ResetPasswordResponse {
  newPassword: string;
}

export const userService = {
  getAll: () => apiClient.get<UserListItem[]>("/users"),
  create: (request: CreateUserRequest) => apiClient.post<CreateUserResponse>("/users", request),
  update: (accountId: string, request: UpdateUserRequest) =>
    apiClient.put<UserListItem>(`/users/${accountId}`, request),
  remove: (accountId: string) => apiClient.delete<void>(`/users/${accountId}`),
  resetPassword: (accountId: string) =>
    apiClient.post<ResetPasswordResponse>(`/users/${accountId}/reset-password`),
};
