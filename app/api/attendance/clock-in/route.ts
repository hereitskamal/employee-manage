// app/api/attendance/clock-in/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";

/**
 * POST /api/attendance/clock-in
 * Clock in for daily attendance
 * 
 * Automatically uses current time and creates/updates today's attendance record
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

        // Get today's date range (using UTC to avoid timezone issues)
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

        // Check if today's attendance record exists (check both date and loginTime for reliability)
        const existingAttendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            $or: [
                { date: { $gte: today, $lte: todayEnd } },
                { loginTime: { $gte: today, $lte: todayEnd } }
            ]
        });

        const currentTime = new Date();

        if (existingAttendance) {
            // If already clocked in, return existing record
            if (existingAttendance.loginTime) {
                const populated = await Attendance.findById(existingAttendance._id)
                    .populate("userId", "name email role department")
                    .lean();

                return NextResponse.json(
                    { 
                        attendance: populated, 
                        message: "Already clocked in for today",
                        alreadyClockedIn: true
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

