import { apiClient, clearStoredToken, setStoredToken } from "../apiClient";
import { clearStoredUser, setStoredUser, type StoredUser } from "../authStorage";

export interface LoginResponse extends StoredUser {
  token: string;
  expiresAt: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const result = await apiClient.post<LoginResponse>("/auth/login", { username, password });
  setStoredToken(result.token);
  setStoredUser({
    accountId: result.accountId,
    username: result.username,
    roleId: result.roleId,
    roleName: result.roleName,
    displayName: result.displayName,
  });
  return result;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearStoredToken();
    clearStoredUser();
  }
}
