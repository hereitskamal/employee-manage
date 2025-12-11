// app/api/employees/bulk-delete/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";

/**
 * =========================================================
 * ✅ POST /api/employees/bulk-delete
 * Bulk delete multiple employee accounts (Admin only)
 *
 * Flow:
 *  1. Verify admin session
 *  2. Validate incoming IDs
 *  3. Filter valid MongoDB ObjectIds
 *  4. Delete employees (excluding admins)
 * =========================================================
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        /**
         * ---------------------------------------------------------
         * 1. Authorization — Only admins can bulk delete
         * ---------------------------------------------------------
         */
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { ids } = await req.json();

        /**
         * ---------------------------------------------------------
         * 2. Validate request body
         * ---------------------------------------------------------
         */
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { message: "No ids provided" },
                { status: 400 }
            );
        }

        /**
         * ---------------------------------------------------------
         * 3. Filter only valid MongoDB ObjectIds
         * ---------------------------------------------------------
         */
        const validIds = ids.filter((id: string) =>
            mongoose.Types.ObjectId.isValid(id)
        );

        await connectToDB();

        /**
         * ---------------------------------------------------------
         * 4. Perform bulk deletion
         * Prevent accidental deletion of admins
         * ---------------------------------------------------------
         */
        const result = await User.deleteMany({
            _id: { $in: validIds },
            role: { $ne: "admin" },
        });

        return NextResponse.json({
            message: "Employees deleted successfully",
            deletedCount: result.deletedCount,
        });

    } catch (error) {
        console.error("Bulk delete error:", error);

        /**
         * ---------------------------------------------------------
         * 5. Error Handling
         * ---------------------------------------------------------
         */
        return NextResponse.json(
            { message: "Failed to delete employees" },
            { status: 500 }
        );
    }
}
