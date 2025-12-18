// app/api/attendance/clock-out/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";

/**
 * PUT /api/attendance/clock-out
 * Clock out for daily attendance
 * 
 * Automatically uses current time and updates today's attendance record
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
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

        // Find today's attendance record (check both date and loginTime for reliability)
        const attendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            $or: [
                { date: { $gte: today, $lte: todayEnd } },
                { loginTime: { $gte: today, $lte: todayEnd } }
            ]
        });

        if (!attendance) {
            return NextResponse.json(
                { message: "No attendance record found for today. Please clock in first." },
                { status: 404 }
            );
        }

        // Validate that user has clocked in
        if (!attendance.loginTime) {
            return NextResponse.json(
                { message: "You must clock in before clocking out." },
                { status: 400 }
            );
        }

        // Check if already clocked out
        if (attendance.logoutTime) {
            const populated = await Attendance.findById(attendance._id)
                .populate("userId", "name email role department")
                .lean();

            return NextResponse.json(
                { 
                    attendance: populated, 
                    message: "Already clocked out for today",
                    alreadyClockedOut: true
                },
                { status: 200 }
            );
        }

        // Update with logout time
        const currentTime = new Date();
        attendance.logoutTime = currentTime;

        // Calculate duration in minutes
        const duration = Math.round(
            (currentTime.getTime() - attendance.loginTime.getTime()) / (1000 * 60)
        );
        attendance.duration = duration;

        // Update status based on duration (4 hours = 240 minutes threshold for "present")
        // Adjust threshold as needed
        const thresholdMinutes = 240; // 4 hours
        if (duration >= thresholdMinutes) {
            attendance.status = "present";
        } else {
            attendance.status = "partial";
        }

        await attendance.save();

        const populated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role department")
            .lean();

        return NextResponse.json(
            { 
                attendance: populated, 
                message: "Clocked out successfully",
                alreadyClockedOut: false
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

