// hooks/usePermissions.ts
"use client";

import { useSession } from "next-auth/react";
import { can, Action, Resource } from "@/lib/permissions";

export function usePermissions() {
    const { data: session } = useSession();
    // Note: permissions field is not currently in the session type, but can be added if needed
    const perms = undefined as string[] | undefined;

    return {
        can: (resource: Resource, action: Action) => can(perms, resource, action),
    };
}
