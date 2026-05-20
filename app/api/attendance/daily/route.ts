// app/api/attendance/daily/route.ts
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
import { Attendance } from "@/models/Attendance";
import { success, failure } from "@/lib/apiResponse";

export async function GET(req: Request) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        if (session.role !== "admin" && session.role !== "manager") {
            return failure("Forbidden", 403);
        }

        await connectToDB();

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let dateFilter: Record<string, unknown> = {};

        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const targetDateEnd = new Date(targetDate);
            targetDateEnd.setHours(23, 59, 59, 999);
            dateFilter = { date: { $gte: targetDate, $lte: targetDateEnd } };
        } else if (startDate || endDate) {
            const dateRange: { $gte?: Date; $lte?: Date } = {};
            if (startDate) dateRange.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateRange.$lte = end;
            }
            dateFilter.date = dateRange;
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            dateFilter = { date: { $gte: today, $lte: todayEnd } };
        }

        const attendanceRecords = await Attendance.find(dateFilter)
            .populate("userId", "name email role department")
            .sort({ loginTime: -1 })
            .lean();

        const stats = await Attendance.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const presentCount = stats.find((s) => s._id === "present")?.count || 0;
        const absentCount = stats.find((s) => s._id === "absent")?.count || 0;
        const partialCount = stats.find((s) => s._id === "partial")?.count || 0;

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
                .map((a) => (a.userId as { _id?: { toString(): string }; toString(): string })._id?.toString() ?? a.userId.toString());

            absentUsers = allUsers.filter(
                (user) => !presentUserIds.includes(user._id.toString())
            );
        }

        return success({
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
        return failure("Failed to fetch daily attendance logs", 500);
    }
}
