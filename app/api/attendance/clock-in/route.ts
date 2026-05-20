// app/api/attendance/clock-in/route.ts
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
import { isWithinClockInWindow, getTodayDateRange } from "@/lib/utils/attendance";
import { ATTENDANCE_ERRORS } from "@/lib/constants/attendance";
import { success, failure } from "@/lib/apiResponse";

export async function POST(req: Request) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        await connectToDB();

        const userId = session.id;
        if (!userId) return failure("User ID is required", 400);

        const currentTime = new Date();

        const timeWindowValidation = isWithinClockInWindow(currentTime);
        if (!timeWindowValidation.isValid) {
            return failure(timeWindowValidation.error!, 400, "CLOCK_IN_OUTSIDE_WINDOW");
        }

        const { today, todayEnd } = getTodayDateRange();

        const existingAttendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            $or: [
                { date: { $gte: today, $lte: todayEnd } },
                { loginTime: { $gte: today, $lte: todayEnd } },
            ],
        });

        if (existingAttendance) {
            if (existingAttendance.loginTime) {
                const populated = await Attendance.findById(existingAttendance._id)
                    .populate("userId", "name email role department")
                    .lean();

                return success({ attendance: populated, alreadyClockedIn: true });
            }

            existingAttendance.loginTime = currentTime;
            existingAttendance.status = "present";
            await existingAttendance.save();

            const populated = await Attendance.findById(existingAttendance._id)
                .populate("userId", "name email role department")
                .lean();

            return success({ attendance: populated, alreadyClockedIn: false });
        }

        const attendance = await Attendance.create({
            userId: new mongoose.Types.ObjectId(userId),
            loginTime: currentTime,
            date: today,
            status: "present",
        });

        const populated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role department")
            .lean();

        return success({ attendance: populated, alreadyClockedIn: false }, 201);

    } catch (error) {
        console.error("Clock in error:", error);
        return failure("Failed to clock in", 500);
    }
}
