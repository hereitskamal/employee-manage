// lib/audit.ts
import { connectToDB } from "@/lib/db";
import { AuditLog, type AuditAction, type AuditResource } from "@/models/AuditLog";
import mongoose from "mongoose";

export interface AuditLogParams {
    userId: string | mongoose.Types.ObjectId;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string | mongoose.Types.ObjectId;
    metadata?: Record<string, unknown>;
}

/**
 * Log an audit event asynchronously (non-blocking)
 * 
 * This function fires and forgets - it won't block the main request.
 * Errors are logged but don't affect the main operation.
 * 
 * @param params - Audit log parameters
 * 
 * @example
 * ```ts
 * // Log employee creation
 * logAudit({
 *   userId: session.user.id,
 *   action: "create",
 *   resource: "employee",
 *   resourceId: employee._id,
 *   metadata: { name: employee.name, email: employee.email }
 * });
 * 
 * // Log employee update
 * logAudit({
 *   userId: session.user.id,
 *   action: "update",
 *   resource: "employee",
 *   resourceId: employee._id,
 *   metadata: { changedFields: ["name", "salary"] }
 * });
 * 
 * // Log employee delete
 * logAudit({
 *   userId: session.user.id,
 *   action: "delete",
 *   resource: "employee",
 *   resourceId: id,
 *   metadata: { deletedName: employee.name }
 * });
 * ```
 */
export function logAudit(params: AuditLogParams): void {
    // Fire and forget - don't await, don't block
    (async () => {
        try {
            // Ensure DB connection
            await connectToDB();

            // Convert string IDs to ObjectId if needed
            const userId =
                typeof params.userId === "string"
                    ? new mongoose.Types.ObjectId(params.userId)
                    : params.userId;

            const resourceId = params.resourceId
                ? typeof params.resourceId === "string"
                    ? new mongoose.Types.ObjectId(params.resourceId)
                    : params.resourceId
                : undefined;

            // Create audit log entry
            await AuditLog.create({
                userId,
                action: params.action,
                resource: params.resource,
                resourceId,
                metadata: params.metadata || {},
            });
        } catch (error) {
            // Log error but don't throw - audit logging should never break main flow
            console.error("[Audit Log Error]", error);
        }
    })();
}

/**
 * Helper function to get user ID from session
 * Returns null if session is not available
 */
export function getUserIdFromSession(
    session: { user?: { id?: string } } | null
): string | null {
    return session?.user?.id || null;
}




