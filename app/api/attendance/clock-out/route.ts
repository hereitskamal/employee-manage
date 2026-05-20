// app/api/attendance/clock-out/route.ts
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
import mongoose from "mongoose";
import {
    calculateDuration,
    determineAttendanceStatus,
    getTodayDateRange,
} from "@/lib/utils/attendance";
import { ATTENDANCE_ERRORS } from "@/lib/constants/attendance";
import { success, failure } from "@/lib/apiResponse";

export async function PUT(req: Request) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        await connectToDB();

        const userId = session.id;
        if (!userId) return failure("User ID is required", 400);

        const { today, todayEnd } = getTodayDateRange();

        const attendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            $or: [
                { date: { $gte: today, $lte: todayEnd } },
                { loginTime: { $gte: today, $lte: todayEnd } },
            ],
        });

        if (!attendance) {
            return failure(ATTENDANCE_ERRORS.CLOCK_OUT_NO_RECORD, 404, "NO_ATTENDANCE_RECORD");
        }

        if (!attendance.loginTime) {
            return failure(ATTENDANCE_ERRORS.CLOCK_OUT_NOT_CLOCKED_IN, 400, "NOT_CLOCKED_IN");
        }

        if (attendance.logoutTime) {
            const populated = await Attendance.findById(attendance._id)
                .populate("userId", "name email role department")
                .lean();

            return success({ attendance: populated, alreadyClockedOut: true });
        }

        const currentTime = new Date();
        attendance.logoutTime = currentTime;

        const duration = calculateDuration(attendance.loginTime, currentTime);
        attendance.duration = duration;
        attendance.status = determineAttendanceStatus(duration);

        await attendance.save();

        const populated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role department")
            .lean();

        return success({
            attendance: populated,
            alreadyClockedOut: false,
            duration,
            status: attendance.status,
        });

    } catch (error) {
        console.error("Clock out error:", error);
        return failure("Failed to clock out", 500);
    }
}
