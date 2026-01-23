// app/api/attendance/clock-in/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";
import { isWithinClockInWindow, getTodayDateRange } from "@/lib/utils/attendance";
import { ATTENDANCE_ERRORS } from "@/lib/constants/attendance";

/**
 * POST /api/attendance/clock-in
 * Clock in for daily attendance
 * 
 * Business Rules:
 * 1. Clock-in is only allowed within the configured time window (default: 6 AM - 10 AM)
 * 2. Prevents double clock-in (returns existing record if already clocked in)
 * 3. Automatically uses current time and creates/updates today's attendance record
 * 
 * Logic Flow:
 * 1. Authenticate user session
 * 2. Validate clock-in time is within allowed window
 * 3. Check if attendance record exists for today
 * 4. If exists and already clocked in, return existing record
 * 5. If exists but not clocked in, update with login time
 * 6. If new, create attendance record with login time
 */
export async function POST(req: Request) {
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

        const currentTime = new Date();

        // Rule 1: Validate clock-in time window
        // Prevent clock-in outside allowed time window
        const timeWindowValidation = isWithinClockInWindow(currentTime);
        if (!timeWindowValidation.isValid) {
            return NextResponse.json(
                { 
                    message: timeWindowValidation.error,
                    error: "CLOCK_IN_OUTSIDE_WINDOW"
                },
                { status: 400 }
            );
        }

        // Get today's date range (using UTC to avoid timezone issues)
        const { today, todayEnd } = getTodayDateRange();

        // Check if today's attendance record exists (check both date and loginTime for reliability)
        const existingAttendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            $or: [
                { date: { $gte: today, $lte: todayEnd } },
                { loginTime: { $gte: today, $lte: todayEnd } }
            ]
        });

        if (existingAttendance) {
            // Rule 2: Prevent double clock-in
            // If already clocked in, return existing record with appropriate message
            if (existingAttendance.loginTime) {
                const populated = await Attendance.findById(existingAttendance._id)
                    .populate("userId", "name email role department")
                    .lean();

                return NextResponse.json(
                    { 
                        attendance: populated, 
                        message: ATTENDANCE_ERRORS.CLOCK_IN_ALREADY_CLOCKED_IN,
                        alreadyClockedIn: true,
                        error: "ALREADY_CLOCKED_IN"
                    },
                    { status: 200 }
                );
            }

            // Update existing record with login time
            existingAttendance.loginTime = currentTime;
            existingAttendance.status = "present";
            await existingAttendance.save();

            const populated = await Attendance.findById(existingAttendance._id)
                .populate("userId", "name email role department")
                .lean();

            return NextResponse.json(
                { 
                    attendance: populated, 
                    message: "Clocked in successfully",
                    alreadyClockedIn: false
                },
                { status: 200 }
            );
        }

        // Create new attendance record with today's date in UTC
        const attendance = await Attendance.create({
            userId: new mongoose.Types.ObjectId(userId),
            loginTime: currentTime,
            date: today, // Store as UTC midnight for consistency
            status: "present",
        });

        const populated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role department")
            .lean();

        return NextResponse.json(
            { 
                attendance: populated, 
                message: "Clocked in successfully",
                alreadyClockedIn: false
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Clock in error:", error);
        return NextResponse.json(
            { message: "Failed to clock in" },
            { status: 500 }
        );
    }
}

