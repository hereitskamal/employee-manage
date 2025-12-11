// models/Role.ts
import mongoose, { Schema, models } from "mongoose";

export interface IRole extends mongoose.Document {
    name: string;
    key: string;
    permissions: string[];
}

const RoleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: true,
        },
        key: {
            type: String,
            required: true,
            unique: true,
        },
        permissions: {
            type: [String],
            required: true,
        },
    },
    { timestamps: true }
);

export const Role = models.Role || mongoose.model<IRole>("Role", RoleSchema);
