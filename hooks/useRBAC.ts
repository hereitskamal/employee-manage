// hooks/useRBAC.ts
"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/lib/rbac"; // or from models/User, same union type

export function useRBAC() {
  const { data: session } = useSession();

  const role = session?.user?.role as UserRole | undefined;

  const hasRole = (...allowed: UserRole[]) =>
    !!role && allowed.includes(role);

  return { role, hasRole };
}
