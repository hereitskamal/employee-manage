// lib/permissions.ts

// you can refine Action/Resource types later if you want
export type Action = "read" | "create" | "update" | "delete" | "manage" | "export";
export type Resource = string; // "employees", "projects", "attendance", etc.

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
