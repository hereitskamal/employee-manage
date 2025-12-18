// app/api/attendance/daily/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";

/**
 * GET /api/attendance/daily
 * Get daily attendance logs for admin
 * 
 * Returns aggregated daily attendance data
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only admin and manager can access daily logs
        if (session.user.role !== "admin" && session.user.role !== "manager") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        await connectToDB();

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date"); // YYYY-MM-DD format
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let dateFilter: Record<string, unknown> = {};

        if (date) {
            // Single date
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const targetDateEnd = new Date(targetDate);
            targetDateEnd.setHours(23, 59, 59, 999);
            dateFilter = {
                date: { $gte: targetDate, $lte: targetDateEnd },
            };
        } else if (startDate || endDate) {
            // Date range
            dateFilter.date = {};
            if (startDate) {
                dateFilter.date.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.date.$lte = end;
            }
        } else {
            // Default to today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            dateFilter = {
                date: { $gte: today, $lte: todayEnd },
            };
        }

        // Get all attendance records for the date(s)
        const attendanceRecords = await Attendance.find(dateFilter)
            .populate("userId", "name email role department")
            .sort({ loginTime: -1 })
            .lean();

        // Aggregate statistics
        const stats = await Attendance.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const presentCount = stats.find((s) => s._id === "present")?.count || 0;
        const absentCount = stats.find((s) => s._id === "absent")?.count || 0;
        const partialCount = stats.find((s) => s._id === "partial")?.count || 0;

        // Get users who haven't logged in today (if single date)
        let absentUsers: unknown[] = [];
        if (date || (!startDate && !endDate)) {
            const targetDate = date ? new Date(date) : new Date();
            targetDate.setHours(0, 0, 0, 0);
            const targetDateEnd = new Date(targetDate);
            targetDateEnd.setHours(23, 59, 59, 999);

            const { User } = await import("@/models/User");
            const allUsers = await User.find({
                role: { $in: ["employee", "manager", "spc"] },
            })
                .select("name email role department")
                .lean();

            const presentUserIds = attendanceRecords
                .filter((a) => a.status === "present")
                .map((a) => a.userId._id?.toString() || a.userId.toString());

            absentUsers = allUsers.filter(
                (user) => !presentUserIds.includes(user._id.toString())
            );
        }

        return NextResponse.json({
            date: date || new Date().toISOString().split("T")[0],
            records: attendanceRecords,
            statistics: {
                present: presentCount,
                absent: absentCount,
                partial: partialCount,
                total: attendanceRecords.length,
            },
            absentUsers,
        });

    } catch (error) {
        console.error("Daily attendance logs error:", error);
        return NextResponse.json(
            { message: "Failed to fetch daily attendance logs" },
            { status: 500 }
        );
    }
}

