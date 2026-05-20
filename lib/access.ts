// lib/access.ts
// Central definition of all access control rules in the system

import { UserRole, ROLE_RANK } from "./roles";
export type { UserRole };

export const ROUTE_ACCESS: Record<string, string[]> = {
  "/dashboard/admin": ["admin"],
  "/dashboard/employees": ["admin", "manager"],
  "/dashboard/attendance/daily-logs": ["admin"],
  "/dashboard/manager": ["admin", "manager"],
  "/dashboard/sales/analysis": ["admin", "manager"],
  "/dashboard/spc": ["admin", "spc"],
  "/dashboard/employee": ["admin", "manager", "employee", "helper", "spc"],
  "/dashboard": ["admin", "manager", "employee", "helper", "spc"],
  "/dashboard/products": ["admin", "manager", "employee", "helper", "spc"],
  "/dashboard/sales": ["admin", "manager", "employee", "helper"],
  "/dashboard/attendance": ["admin", "manager", "employee", "helper", "spc"],
  "/shop": [],
  "/products": [],
  "/cart": ["buyer", "customer", "admin", "manager", "employee", "helper", "spc"],
  "/checkout": ["buyer", "customer", "admin", "manager", "employee", "helper", "spc"],
  "/account": ["buyer", "customer", "admin", "manager", "employee", "helper", "spc"],
  "/orders": ["buyer", "customer", "admin", "manager", "employee", "helper", "spc"],
};

export function canAccessRoute(role: string | undefined, route: string): boolean {
  if (!role) return false;
  if (ROUTE_ACCESS[route]) return ROUTE_ACCESS[route].includes(role);
  for (const [pattern, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (route.startsWith(pattern)) return allowedRoles.includes(role);
  }
  return false;
}

export function getDefaultDashboardRoute(role: string | undefined): string {
  switch (role) {
    case "admin":   return "/dashboard/admin";
    case "manager": return "/dashboard/manager";
    case "spc":     return "/dashboard/spc";
    case "employee":
    case "helper":  return "/dashboard/employee";
    case "customer":
    case "buyer":   return "/shop";
    default:        return "/dashboard";
  }
}

export type Resource = "employees" | "products" | "sales" | "attendance" | "orders" | "cart";
export type Action = "read" | "create" | "update" | "delete" | "manage" | "export" | "view_analysis";

export const ROLE_PERMISSIONS: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  admin: {
    employees: ["read", "create", "update", "delete", "manage", "export"],
    products:  ["read", "create", "update", "delete", "manage", "export"],
    sales:     ["read", "create", "update", "delete", "manage", "export", "view_analysis"],
    attendance:["read", "create", "update", "delete", "manage", "export"],
  },
  manager: {
    employees: ["read", "export"],
    products:  ["read", "create", "update", "delete", "manage", "export"],
    sales:     ["read", "create", "update", "delete", "manage", "export", "view_analysis"],
    attendance:["read", "export"],
  },
  spc: {
    products:  ["read", "create", "update", "delete", "manage"],
    sales:     ["read", "create"],
    attendance:["read"],
  },
  employee: {
    products:  ["read"],
    sales:     ["read", "create"],
    attendance:["read"],
  },
  helper: {
    products:  ["read"],
    sales:     ["read", "create"],
    attendance:["read"],
  },
  customer: {
    products: ["read"],
    cart:     ["manage"],
    orders:   ["read", "create"],
  },
  buyer: {
    products: ["read"],
    cart:     ["manage"],
    orders:   ["read", "create"],
  },
};

export function canPerformAction(role: string | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;
  return permissions[resource]?.includes(action) ?? false;
}

export function isPrivileged(role: string | undefined): boolean {
  return role === "admin" || role === "manager";
}

export function canManageEmployees(role: string | undefined): boolean {
  return canPerformAction(role, "employees", "manage");
}

export function canViewSalesAnalysis(role: string | undefined): boolean {
  return canPerformAction(role, "sales", "view_analysis");
}

export function canManageProducts(role: string | undefined): boolean {
  return canPerformAction(role, "products", "manage");
}

export function canCreateProducts(role: string | undefined): boolean {
  return canPerformAction(role, "products", "create");
}

export function canViewAllAttendance(role: string | undefined): boolean {
  return isPrivileged(role);
}

export function getRolesForRoute(route: string): string[] {
  if (ROUTE_ACCESS[route]) return ROUTE_ACCESS[route];
  for (const [pattern, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (route.startsWith(pattern)) return allowedRoles;
  }
  return [];
}

export function hasAnyRole(role: string | undefined, allowedRoles: string[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}

export function hasAtLeastRole(role: string | undefined, minRole: UserRole): boolean {
  if (!role) return false;
  const userRank = ROLE_RANK[role as UserRole] ?? 0;
  return userRank >= ROLE_RANK[minRole];
}
