import { apiClient, clearStoredToken, setStoredToken } from "../apiClient";
import { clearStoredUser, setStoredUser, type StoredUser } from "../authStorage";

export interface LoginResponse extends StoredUser {
  token: string;
  expiresAt: string;
}

export interface OtpChallengeResponse {
  reference: string;
  maskedEmail: string;
  expiresAt: string;
  demoOtp?: string | null;
  demoResetLink?: string | null;
  message: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface RegisterCustomerRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
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

export const registerCustomer = (data: RegisterCustomerRequest) =>
  apiClient.post<OtpChallengeResponse>("/auth/register", data);

export const verifyRegistration = (username: string, otp: string) =>
  apiClient.post<AuthMessageResponse>("/auth/register/verify", { username, otp });

export const resendRegistrationOtp = (username: string) =>
  apiClient.post<OtpChallengeResponse>("/auth/register/resend-otp", { username });

export const requestPasswordReset = (email: string) =>
  apiClient.post<OtpChallengeResponse>("/auth/forgot-password", { email });

export const resetPassword = (email: string, otp: string, newPassword: string, confirmPassword: string) =>
  apiClient.post<AuthMessageResponse>("/auth/reset-password", { email, otp, newPassword, confirmPassword });
