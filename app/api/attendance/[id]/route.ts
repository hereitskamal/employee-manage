// app/api/attendance/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
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
import { resolveRouteParams, type RouteContext } from "@/types/nextjs";
import { success, failure } from "@/lib/apiResponse";

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failure("Invalid attendance ID", 400);
        }

        await connectToDB();

        const isPrivileged = session.role === "admin" || session.role === "manager";
        const query: Record<string, unknown> = { _id: id };
        if (!isPrivileged) query.userId = new mongoose.Types.ObjectId(session.id);

        const attendance = await Attendance.findOne(query)
            .populate("userId", "name email role")
            .lean();

        if (!attendance) return failure("Attendance record not found", 404);

        return success({ attendance });
    } catch (error) {
        console.error("Fetch attendance error:", error);
        return failure("Failed to fetch attendance", 500);
    }
}

export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failure("Invalid attendance ID", 400);
        }

        const body = await req.json();
        const { logoutTime, status, notes } = body;

        await connectToDB();

        const isPrivileged = session.role === "admin" || session.role === "manager";
        const query: Record<string, unknown> = { _id: id };
        if (!isPrivileged) query.userId = new mongoose.Types.ObjectId(session.id);

        const attendance = await Attendance.findOne(query);
        if (!attendance) return failure("Attendance record not found", 404);

        if (logoutTime !== undefined) {
            attendance.logoutTime = logoutTime ? new Date(logoutTime) : null;
            if (attendance.logoutTime && attendance.loginTime) {
                attendance.duration = Math.round(
                    (attendance.logoutTime.getTime() - attendance.loginTime.getTime()) / (1000 * 60)
                );
            }
        }
        if (status) attendance.status = status;
        if (notes !== undefined) attendance.notes = notes;

        await attendance.save();

        const updated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role")
            .lean();

        return success({ attendance: updated });
    } catch (error) {
        console.error("Update attendance error:", error);
        return failure("Failed to update attendance", 500);
    }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        const isPrivileged = session.role === "admin" || session.role === "manager";
        if (!isPrivileged) {
            return failure("Only admins and managers can delete attendance records", 403);
        }

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return failure("Invalid attendance ID", 400);
        }

        await connectToDB();

        const attendance = await Attendance.findByIdAndDelete(id);
        if (!attendance) return failure("Attendance record not found", 404);

        return success({ message: "Attendance record deleted successfully" });
    } catch (error) {
        console.error("Delete attendance error:", error);
        return failure("Failed to delete attendance", 500);
    }
}
