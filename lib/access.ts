// lib/access.ts
// Central definition of all access control rules in the system
// This is the single source of truth for accessibility/access control

import { UserRole, ROLES } from "./roles";

/**
 * Route access definitions
 * Maps route patterns to allowed roles
 */
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  // Admin-only routes
  "/dashboard/admin": ["admin"],
  "/dashboard/employees": ["admin", "manager"],
  "/dashboard/attendance/daily-logs": ["admin"],

  // Manager and Admin routes
  "/dashboard/manager": ["admin", "manager"],
  "/dashboard/sales/analysis": ["admin", "manager"],

  // SPC-specific routes
  "/dashboard/spc": ["admin", "spc"],

  // Employee/Helper routes
  "/dashboard/employee": ["admin", "manager", "employee", "helper", "spc"],

  // Common routes accessible to multiple roles
  "/dashboard": ["admin", "manager", "employee", "helper", "spc"],
  "/dashboard/products": ["admin", "manager", "employee", "helper", "spc"],
  "/dashboard/sales": ["admin", "manager", "employee", "helper"],
  "/dashboard/attendance": ["admin", "manager", "employee", "helper", "spc"],
};

/**
 * Check if a route is accessible by a role
 */
export function canAccessRoute(role: UserRole | undefined, route: string): boolean {
  if (!role) return false;

  // Check exact match first
  if (ROUTE_ACCESS[route]) {
    return ROUTE_ACCESS[route].includes(role);
  }

  // Check prefix matches (for nested routes)
  for (const [pattern, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (route.startsWith(pattern)) {
      return allowedRoles.includes(role);
    }
  }

  // Default: deny access if route not defined
  return false;
}

/**
 * Get the default dashboard route for a role
 */
export function getDefaultDashboardRoute(role: UserRole | undefined): string {
  if (!role) return "/dashboard";

  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "manager":
      return "/dashboard/manager";
    case "spc":
      return "/dashboard/spc";
    case "employee":
    case "helper":
      return "/dashboard/employee";
    default:
      return "/dashboard";
  }
}

/**
 * Resource types in the system
 */
export type Resource = "employees" | "products" | "sales" | "attendance";

/**
 * Action types
 */
export type Action = "read" | "create" | "update" | "delete" | "manage" | "export" | "view_analysis";

/**
 * Permission definitions for each role
 * Maps role -> resource -> allowed actions
 */
export const ROLE_PERMISSIONS: Record<
  UserRole,
  Partial<Record<Resource, Action[]>>
> = {
  admin: {
    employees: ["read", "create", "update", "delete", "manage", "export"],
    products: ["read", "create", "update", "delete", "manage", "export"],
    sales: ["read", "create", "update", "delete", "manage", "export", "view_analysis"],
    attendance: ["read", "create", "update", "delete", "manage", "export"],
  },
  manager: {
    employees: ["read", "export"],
    products: ["read", "create", "update", "delete", "manage", "export"],
    sales: ["read", "create", "update", "delete", "manage", "export", "view_analysis"],
    attendance: ["read", "export"],
  },
  spc: {
    products: ["read", "create", "update", "delete", "manage"],
    sales: ["read", "create"],
    attendance: ["read"],
  },
  employee: {
    products: ["read"],
    sales: ["read", "create"],
    attendance: ["read"],
  },
  helper: {
    products: ["read"],
    sales: ["read", "create"],
    attendance: ["read"],
  },
};

/**
 * Check if a role can perform an action on a resource
 */
export function canPerformAction(
  role: UserRole | undefined,
  resource: Resource,
  action: Action
): boolean {
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];
  const resourcePermissions = permissions[resource];

  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Check if a role has privileged access (admin or manager)
 */
export function isPrivileged(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === "admin" || role === "manager";
}

/**
 * Check if a role can manage employees
 */
export function canManageEmployees(role: UserRole | undefined): boolean {
  return canPerformAction(role, "employees", "manage");
}

/**
 * Check if a role can view sales analysis
 */
export function canViewSalesAnalysis(role: UserRole | undefined): boolean {
  return canPerformAction(role, "sales", "view_analysis");
}

/**
 * Check if a role can manage products
 */
export function canManageProducts(role: UserRole | undefined): boolean {
  return canPerformAction(role, "products", "manage");
}

/**
 * Check if a role can create products
 */
export function canCreateProducts(role: UserRole | undefined): boolean {
  return canPerformAction(role, "products", "create");
}

/**
 * Check if a role can view all attendance (not just own)
 */
export function canViewAllAttendance(role: UserRole | undefined): boolean {
  return isPrivileged(role);
}

/**
 * Get all roles that can access a specific route
 */
export function getRolesForRoute(route: string): UserRole[] {
  // Check exact match first
  if (ROUTE_ACCESS[route]) {
    return ROUTE_ACCESS[route];
  }

  // Check prefix matches
  for (const [pattern, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (route.startsWith(pattern)) {
      return allowedRoles;
    }
  }

  return [];
}

/**
 * Check if a role is in a list of allowed roles
 */
export function hasAnyRole(role: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}

