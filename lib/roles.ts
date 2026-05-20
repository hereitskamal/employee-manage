// lib/roles.ts
// Central definition of all user roles in the system
// This is the single source of truth for roles

import { z } from "zod";

/**
 * All available roles in the system
 */
export const ROLES = ["admin", "manager", "employee", "helper", "spc"] as const;

/**
 * TypeScript type for user roles
 */
export type UserRole = typeof ROLES[number];

/**
 * Role hierarchy ranking (higher number = more privileges)
 * Helper has same rank as employee (1)
 */
export const ROLE_RANK: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  spc: 2,
  employee: 1,
  helper: 1,
};

/**
 * Zod enum for role validation
 */
export const ROLE_ENUM = z.enum(ROLES as unknown as [UserRole, ...UserRole[]]);

/**
 * Check if a user has one of the allowed roles
 */
export function hasRole(
  userRole: UserRole | undefined,
  allowed: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

/**
 * Check if a user has at least the minimum role level
 */
export function hasAtLeastRole(
  userRole: UserRole | undefined,
  minRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

/**
 * Get all roles with at least the specified rank
 */
export function getRolesWithMinRank(minRank: number): UserRole[] {
  return ROLES.filter((role) => ROLE_RANK[role] >= minRank);
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return ROLES.includes(role as UserRole);
}

