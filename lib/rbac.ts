// lib/rbac.ts
export type UserRole = "admin" | "manager" | "employee" | "spc";

export const ROLE_RANK: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  spc: 2,
  employee: 1,
};

export function hasRole(
  userRole: UserRole | undefined,
  allowed: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

export function hasAtLeastRole(
  userRole: UserRole | undefined,
  minRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}
