// app/api/attendance/clock-out/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";
import { 
    calculateDuration, 
    determineAttendanceStatus, 
    getTodayDateRange 
} from "@/lib/utils/attendance";
import { ATTENDANCE_ERRORS } from "@/lib/constants/attendance";

/**
 * PUT /api/attendance/clock-out
 * Clock out for daily attendance
 * 
 * Business Rules:
 * 1. Prevents double clock-out (returns existing record if already clocked out)
 * 2. Validates that user has clocked in before allowing clock-out
 * 3. Auto-marks attendance as "partial" if duration < configured minimum hours (default: 8 hours)
 * 4. Auto-marks attendance as "present" if duration >= configured minimum hours
 * 
 * Logic Flow:
 * 1. Authenticate user session
 * 2. Find today's attendance record
 * 3. Validate attendance record exists
 * 4. Validate user has clocked in
 * 5. Check if already clocked out (prevent double clock-out)
 * 6. Calculate duration from login to logout time
 * 7. Determine status based on duration (present vs partial)
 * 8. Save updated attendance record
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDB();

        const userId = session.user.id;
        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        // Get today's date range (using UTC to avoid timezone issues)
        const { today, todayEnd } = getTodayDateRange();

        // Find today's attendance record (check both date and loginTime for reliability)
        const attendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            $or: [
                { date: { $gte: today, $lte: todayEnd } },
                { loginTime: { $gte: today, $lte: todayEnd } }
            ]
        });

        // Rule 1: Validate attendance record exists
        if (!attendance) {
            return NextResponse.json(
                { 
                    message: ATTENDANCE_ERRORS.CLOCK_OUT_NO_RECORD,
                    error: "NO_ATTENDANCE_RECORD"
                },
                { status: 404 }
            );
        }

        // Rule 2: Validate that user has clocked in
        if (!attendance.loginTime) {
            return NextResponse.json(
                { 
                    message: ATTENDANCE_ERRORS.CLOCK_OUT_NOT_CLOCKED_IN,
                    error: "NOT_CLOCKED_IN"
                },
                { status: 400 }
            );
        }

        // Rule 3: Prevent double clock-out
        // Check if already clocked out
        if (attendance.logoutTime) {
            const populated = await Attendance.findById(attendance._id)
                .populate("userId", "name email role department")
                .lean();

            return NextResponse.json(
                { 
                    attendance: populated, 
                    message: ATTENDANCE_ERRORS.CLOCK_OUT_ALREADY_CLOCKED_OUT,
                    alreadyClockedOut: true,
                    error: "ALREADY_CLOCKED_OUT"
                },
                { status: 200 }
            );
        }

        // Update with logout time
        const currentTime = new Date();
        attendance.logoutTime = currentTime;

        // Calculate duration in minutes
        const duration = calculateDuration(attendance.loginTime, currentTime);
        attendance.duration = duration;

        // Rule 4: Auto-mark partial day if duration < configured hours
        // Determine status based on duration using configurable threshold
        attendance.status = determineAttendanceStatus(duration);

        await attendance.save();

        const populated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role department")
            .lean();

        return NextResponse.json(
            { 
                attendance: populated, 
                message: "Clocked out successfully",
                alreadyClockedOut: false,
                duration: duration,
                status: attendance.status
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Clock out error:", error);
        return NextResponse.json(
            { message: "Failed to clock out" },
            { status: 500 }
        );
    }
}

