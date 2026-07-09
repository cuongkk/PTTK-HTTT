const USER_STORAGE_KEY = "auth_user";

export interface StoredUser {
  accountId: string;
  username: string;
  roleId: string;
  roleName: string;
  displayName: string;
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function mapRoleIdToPath(roleId: string): string {
  switch (roleId) {
    case "system_admin":
      return "system-admin";
    case "quan_ly":
      return "manager";
    case "sale":
      return "sales";
    case "ke_toan":
      return "accountant";
    default:
      return "customer";
  }
}
