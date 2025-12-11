// models/User.ts
import mongoose, { Schema, models } from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password?: string;
    role: "admin" | "manager" | "employee" | "helper";
    image?: string;
    provider?: "credentials" | "google";

    // employee fields
    phone?: string;
    department?: string;
    title?: string;
    salary?: number;
    hireDate?: Date;
    location?: string;
    age?: number;
    performance?: number;
    createdBy?: mongoose.Types.ObjectId; // admin who created

    // onboarding flags
    isProfileComplete: boolean;
    mustSetPassword: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            // required only if provider is 'credentials' *and* mustSetPassword is false
            required: function (this: IUser) {
                return this.provider === "credentials" && !this.mustSetPassword;
            },
        },
        role: {
            type: String,
            enum: ["admin", "manager", "employee", "helper"],
            default: "employee",
        },
        image: String,
        provider: {
            type: String,
            enum: ["credentials", "google"],
            default: "credentials",
        },

        // employee fields
        phone: String,
        department: String,
        title: String,
        salary: { type: Number, min: 0 },
        hireDate: Date,
        location: String,
        age: Number,
        performance: Number,

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User", // admin
            required: false,
        },

        // flags
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        mustSetPassword: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const User = models.User || mongoose.model<IUser>("User", UserSchema);
