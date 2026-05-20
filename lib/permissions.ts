// lib/permissions.ts
// Permission utilities for user-specific permissions
// For role-based access control, use lib/access.ts instead

// Re-export Action and Resource types from access.ts for consistency
import type { Action, Resource } from "./access";

// Re-export for backward compatibility
export type { Action, Resource };

export function buildPermission(resource: Resource, action: Action) {
  return `${resource}:${action}`;
}

export function hasPermission(
  userPermissions: string[] | undefined,
  permission: string
): boolean {
  if (!userPermissions) return false;
  if (userPermissions.includes("*")) return true; // super admin
  return userPermissions.includes(permission);
}

export function can(
  userPermissions: string[] | undefined,
  resource: Resource,
  action: Action
): boolean {
  return hasPermission(userPermissions, buildPermission(resource, action));
}
