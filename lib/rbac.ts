// lib/rbac.ts
// Re-export role definitions from central roles file
// This file maintains backward compatibility while using centralized definitions

export {
  type UserRole,
  ROLES,
  ROLE_RANK,
  ROLE_ENUM,
  hasRole,
  hasAtLeastRole,
  getRolesWithMinRank,
  isValidRole,
} from "./roles";
