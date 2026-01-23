// models/AuditLog.ts
import mongoose, { Schema, models } from "mongoose";

export type AuditAction = "create" | "update" | "delete" | "login";
export type AuditResource = "employee" | "product" | "sale" | "user";

export interface IAuditLog extends mongoose.Document {
    userId: mongoose.Types.ObjectId | string;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: mongoose.Types.ObjectId | string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: ["create", "update", "delete", "login"],
            required: true,
            index: true,
        },
        resource: {
            type: String,
            enum: ["employee", "product", "sale", "user"],
            required: true,
            index: true,
        },
        resourceId: {
            type: Schema.Types.ObjectId,
            required: false,
            index: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            required: false,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound indexes for common queries
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, resource: 1, createdAt: -1 });

export const AuditLog =
    models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);




