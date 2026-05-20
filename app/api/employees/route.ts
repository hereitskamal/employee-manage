// app/api/employees/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { canManageEmployees } from "@/lib/access";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { employeeCreateSchema, formatValidationError } from "@/lib/validators";
import { ZodError } from "zod";
import { logAudit } from "@/lib/audit";
import { success, failure } from "@/lib/apiResponse";

/**
 * ---------------------------------------------------------
 * 🔐 Generate Secure Temporary Password
 * ---------------------------------------------------------
 */
function generateRandomPassword(length = 12): string {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    const bytes = crypto.randomBytes(length);
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[bytes[i] % chars.length];
    }

    return password;
}

/**
 * ---------------------------------------------------------
 * 📧 Nodemailer Transporter (SMTP configuration)
 * ---------------------------------------------------------
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * =========================================================
 * ✅ GET /api/employees
 * Fetch list of all employees (Admin only)
 * =========================================================
 */
export async function GET(req: Request) {
    try {
        const session = await getSession(req);

        if (!session || !canManageEmployees(session.role)) {
            return failure("Unauthorized", 401);
        }

        await connectToDB();

        const employees = await User.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        return success({ employees });

    } catch (error) {
        console.error("Fetch employees error:", error);
        return failure("Failed to fetch employees", 500);
    }
}

/**
 * =========================================================
 * ✅ POST /api/employees
 * Create a new employee (Admin only)
 *
 * Flow:
 *  1. Validate incoming fields
 *  2. Check if email already exists
 *  3. Generate temp password
 *  4. Hash password before saving
 *  5. Create employee record
 *  6. Send email with login details
 * =========================================================
 */
export async function POST(req: Request) {
    try {
        const session = await getSession(req);

        if (!session || !canManageEmployees(session.role)) {
            return failure("Unauthorized", 401);
        }

        const body = await req.json();

        /**
         * ---------------------------------------------------------
         * 1. Validate Request Body with Zod
         * ---------------------------------------------------------
         */
        let validatedData;
        try {
            validatedData = employeeCreateSchema.parse(body);
        } catch (error) {
            if (error instanceof ZodError) {
                return failure(formatValidationError(error), 400, "VALIDATION_ERROR");
            }
            return failure("Invalid request data", 400);
        }

        const {
            name,
            email,
            phone,
            department,
            title,
            salary,
            hireDate,
            location,
            age,
            performance,
            role,
        } = validatedData;

        await connectToDB();

        /**
         * ---------------------------------------------------------
         * 2. Check for Existing User
         * ---------------------------------------------------------
         */
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return failure("User with this email already exists", 409, "EMAIL_CONFLICT");
        }

        /**
         * ---------------------------------------------------------
         * 3. Generate Temporary Password (Plain for Email)
         * ---------------------------------------------------------
         */
        const tempPassword = generateRandomPassword(12);

        /**
         * ---------------------------------------------------------
         * 4. Hash Password Before Storing
         * ---------------------------------------------------------
         */
        const hashedPassword = await hash(tempPassword, 12);

        /**
         * ---------------------------------------------------------
         * 5. Create Employee Record
         * ---------------------------------------------------------
         */
        // Only admin can set role, default to "employee" for others
        const employeeRole = (session?.role === "admin" && role && role !== "admin")
            ? role
            : "employee";

        const employee = await User.create({
            name,
            email: email.toLowerCase(),
            role: employeeRole,
            provider: "credentials",
            phone,
            department,
            title,
            salary: Number(salary),
            hireDate: new Date(hireDate),
            location,
            age,
            performance,
            password: hashedPassword,
            createdBy: session?.id ? new mongoose.Types.ObjectId(session.id) : undefined,
            mustSetPassword: false,
            isProfileComplete: false,
        });

        /**
         * ---------------------------------------------------------
         * 6. Send Email With Login Details
         * ---------------------------------------------------------
         */
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: email,
                subject: "Your Employee Account Login Details",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Welcome, ${name} 👋</h2>
                        <p>Your employee account has been created successfully.</p>
                        <p><strong>Login Email:</strong> ${email}</p>
                        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                        <p style="color:red;"><strong>Please change your password immediately after login.</strong></p>
                        <br/>
                        <p>Regards,</p>
                        <p><strong>HR Team</strong></p>
                    </div>
                `,
            });
        } catch (mailError) {
            console.error("Email send failed:", mailError);
            // Employee stays created even if mail fails
        }

        /**
         * ---------------------------------------------------------
         * 7. Log Audit Event (non-blocking)
         * ---------------------------------------------------------
         */
        logAudit({
            userId: session?.id || employee._id.toString(),
            action: "create",
            resource: "employee",
            resourceId: employee._id,
            metadata: {
                name: employee.name,
                email: employee.email,
                department: employee.department,
                title: employee.title,
            },
        });

        /**
         * ---------------------------------------------------------
         * 8. Success Response
         * ---------------------------------------------------------
         */
        return success({ employee }, 201);

    } catch (error) {
        console.error("Create employee error:", error);
        return failure("Failed to create employee", 500);
    }
}
