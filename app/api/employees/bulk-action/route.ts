// app/api/employees/bulk-action/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { hash } from "bcryptjs";

/**
 * Utility: generate password
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
 * Nodemailer transporter - same approach as other route files.
 * Ensure env variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * POST /api/employees/bulk-action
 *
 * Body:
 * {
 *   ids: string[],
 *   action: "delete" | "changeRole" | "sendWelcome",
 *   role?: string,               // required when action === "changeRole"
 *   sendEmail?: boolean          // optional for some actions; default true for sendWelcome
 * }
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { ids, action, role, sendEmail = true } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: "No ids provided" }, { status: 400 });
        }

        const validIds = ids.filter((id: string) =>
            mongoose.Types.ObjectId.isValid(id)
        );

        if (validIds.length === 0) {
            return NextResponse.json({ message: "No valid ids provided" }, { status: 400 });
        }

        await connectToDB();

        if (action === "delete") {
            // Delete (exclude admins)
            const result = await User.deleteMany({
                _id: { $in: validIds },
                role: { $ne: "admin" },
            });

            return NextResponse.json({
                message: "Employees deleted successfully",
                deletedCount: result.deletedCount ?? 0,
            });
        }

        if (action === "changeRole") {
            if (!role) {
                return NextResponse.json({ message: "Target role not provided" }, { status: 400 });
            }

            const result = await User.updateMany(
                { _id: { $in: validIds }, role: { $ne: "admin" } }, // do not change admin accounts
                { $set: { role } }
            );

            // Safely read modified count (supports both modern and older result shapes)
            const modifiedCount = result.modifiedCount ?? (result as { nModified?: number }).nModified ?? 0;

            // Optionally send notification emails to changed users
            if (sendEmail) {
                const users = await User.find({ _id: { $in: validIds } });
                for (const u of users) {
                    if (u.role === "admin") continue; // skip admins
                    try {
                        await transporter.sendMail({
                            from: process.env.EMAIL_FROM,
                            to: u.email,
                            subject: "Role Updated",
                            html: `
                <div style="font-family: Arial, sans-serif;">
                  <h3>Hello ${u.name},</h3>
                  <p>Your account role has been updated to <strong>${role}</strong>.</p>
                  <p>If you have questions, please contact your administrator.</p>
                  <br/>
                  <p>Regards,<br/>HR Team</p>
                </div>
              `,
                        });
                    } catch (mailErr) {
                        console.error(`Failed send role-change email to ${u.email}:`, mailErr);
                    }
                }
            }

            return NextResponse.json({
                message: "Roles changed successfully",
                modifiedCount,
            });
        }

        if (action === "sendWelcome") {
            // Find users to welcome (skip admins)
            const users = await User.find({ _id: { $in: validIds }, role: { $ne: "admin" } });

            const results: { id: string; email: string; mailed: boolean; error?: string }[] = [];

            for (const u of users) {
                try {
                    // Generate temp password and save (so email contains a usable password)
                    const tempPassword = generateRandomPassword(12);
                    const hashed = await hash(tempPassword, 12);

                    // Update user record: set password and force set password on first login
                    u.password = hashed;
                    u.mustSetPassword = true;
                    u.isProfileComplete = u.isProfileComplete ?? false;
                    await u.save();

                    // Send welcome email
                    if (sendEmail) {
                        await transporter.sendMail({
                            from: process.env.EMAIL_FROM,
                            to: u.email,
                            subject: "Welcome to the Company — Your Account Details",
                            html: `
                <div style="font-family: Arial, sans-serif;">
                  <h2>Welcome, ${u.name} 👋</h2>
                  <p>Your account has been prepared. Use the details below to sign in:</p>
                  <p><strong>Email:</strong> ${u.email}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                  <p style="color:red;"><strong>Please change your password immediately after first login.</strong></p>
                  <br/>
                  <p>Regards,<br/><strong>HR Team</strong></p>
                </div>
              `,
                        });
                    }

                    results.push({ id: u._id.toString(), email: u.email, mailed: true });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    console.error(`Welcome email failed for ${u.email}:`, err);
                    results.push({ id: u._id.toString(), email: u.email, mailed: false, error: errorMessage });
                }
            }

            return NextResponse.json({
                message: "Welcome emails processed",
                results,
                count: results.length,
            });
        }

        return NextResponse.json({ message: "Unknown action" }, { status: 400 });
    } catch (error) {
        console.error("Bulk action error:", error);
        return NextResponse.json({ message: "Failed to process bulk action" }, { status: 500 });
    }
}
