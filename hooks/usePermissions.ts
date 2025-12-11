// hooks/usePermissions.ts
"use client";

import { useSession } from "next-auth/react";
import { can, Action, Resource } from "@/lib/permissions";

export function usePermissions() {
    const { data: session } = useSession();
    const perms = (session?.user as any)?.permissions as string[] | undefined;

    return {
        can: (resource: Resource, action: Action) => can(perms, resource, action),
    };
}
