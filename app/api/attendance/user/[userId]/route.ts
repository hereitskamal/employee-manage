// app/api/attendance/user/[userId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";
import { resolveRouteParams, type RouteContext } from "@/types/nextjs";

/**
 * GET /api/attendance/user/:userId
 * Get attendance records for a specific user
 */
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const params = await resolveRouteParams(context);
        const userId = params.userId || "";

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        // Employees can only see their own attendance
        if (!isPrivileged && session.user.id !== userId) {
            return NextResponse.json(
                { message: "You can only view your own attendance" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const limit = parseInt(searchParams.get("limit") || "30");

        const query: Record<string, unknown> = {
            userId: new mongoose.Types.ObjectId(userId),
        };

        // Date range filter
        if (startDate || endDate) {
            const dateFilter: { $gte?: Date; $lte?: Date } = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            query.date = dateFilter;
        }

        const attendance = await Attendance.find(query)
            .populate("userId", "name email role")
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        // Calculate statistics
        const stats = await Attendance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalDuration: { $sum: "$duration" },
                },
            },
        ]);

        const presentCount = stats.find((s) => s._id === "present")?.count || 0;
        const absentCount = stats.find((s) => s._id === "absent")?.count || 0;
        const partialCount = stats.find((s) => s._id === "partial")?.count || 0;
        const totalDuration = stats.reduce((sum, s) => sum + (s.totalDuration || 0), 0);

        return NextResponse.json({
            attendance,
            statistics: {
                present: presentCount,
                absent: absentCount,
                partial: partialCount,
                totalHours: Math.round(totalDuration / 60), // Convert minutes to hours
            },
        });

    } catch (error) {
        console.error("Fetch user attendance error:", error);
        return NextResponse.json(
            { message: "Failed to fetch user attendance" },
            { status: 500 }
        );
    }
}

