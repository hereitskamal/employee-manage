// app/api/attendance/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";
import { resolveRouteParams, type RouteContext } from "@/types/nextjs";

/**
 * GET /api/attendance/:id
 * Fetch a single attendance record by ID
 */
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid attendance ID" }, { status: 400 });
        }

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        const query: Record<string, unknown> = { _id: id };
        
        // Employees can only see their own attendance
        if (!isPrivileged) {
            query.userId = new mongoose.Types.ObjectId(session.user.id);
        }

        const attendance = await Attendance.findOne(query)
            .populate("userId", "name email role")
            .lean();

        if (!attendance) {
            return NextResponse.json({ message: "Attendance record not found" }, { status: 404 });
        }

        return NextResponse.json(attendance);
    } catch (error) {
        console.error("Fetch attendance error:", error);
        return NextResponse.json(
            { message: "Failed to fetch attendance" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/attendance/:id
 * Update attendance record (e.g., add logout time)
 */
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid attendance ID" }, { status: 400 });
        }

        const body = await req.json();
        const { logoutTime, status, notes } = body;

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        const query: Record<string, unknown> = { _id: id };
        
        // Employees can only update their own attendance
        if (!isPrivileged) {
            query.userId = new mongoose.Types.ObjectId(session.user.id);
        }

        const attendance = await Attendance.findOne(query);
        if (!attendance) {
            return NextResponse.json({ message: "Attendance record not found" }, { status: 404 });
        }

        // Update fields
        if (logoutTime !== undefined) {
            attendance.logoutTime = logoutTime ? new Date(logoutTime) : null;
            // Recalculate duration
            if (attendance.logoutTime && attendance.loginTime) {
                attendance.duration = Math.round(
                    (attendance.logoutTime.getTime() - attendance.loginTime.getTime()) / (1000 * 60)
                );
            }
        }
        if (status) {
            attendance.status = status;
        }
        if (notes !== undefined) {
            attendance.notes = notes;
        }

        await attendance.save();

        const updated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role")
            .lean();

        return NextResponse.json({
            attendance: updated,
            message: "Attendance updated successfully",
        });
    } catch (error) {
        console.error("Update attendance error:", error);
        return NextResponse.json(
            { message: "Failed to update attendance" },
            { status: 500 }
        );
    }
}

