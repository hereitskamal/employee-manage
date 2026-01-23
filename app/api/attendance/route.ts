// app/api/attendance/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";
import { success, failure } from "@/lib/apiResponse";

/**
 * GET /api/attendance
 * Fetch attendance records
 * 
 * Permissions:
 *  - admin + manager → all attendance records
 *  - employee        → only their own attendance
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return failure("Unauthorized", 401);
        }

        await connectToDB();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const userId = searchParams.get("userId");
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        // Build query
        const query: Record<string, unknown> = {};

        // Role-based filtering
        if (!isPrivileged) {
            // Employees can only see their own attendance
            query.userId = new mongoose.Types.ObjectId(session.user.id);
        } else if (userId) {
            query.userId = new mongoose.Types.ObjectId(userId);
        }

        // Date range filter
        if (startDate || endDate) {
            const dateFilter: { $gte?: Date; $lte?: Date } = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            query.date = dateFilter;
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const attendance = await Attendance.find(query)
            .populate("userId", "name email role")
            .sort({ date: -1, loginTime: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Attendance.countDocuments(query);

        return success({
            attendance,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error("Fetch attendance error:", error);
        return failure("Failed to fetch attendance", 500);
    }
}

/**
 * POST /api/attendance
 * Create attendance record (login)
 * 
 * This is typically called automatically on login, but can be called manually
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

        const body = await req.json();
        const { userId, loginTime, date, notes } = body;

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        // Use session user ID if not provided
        let targetUserId = userId || session.user.id;
        if (!targetUserId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        // Non-privileged users can only create attendance for themselves
        if (!isPrivileged && targetUserId !== session.user.id) {
            return NextResponse.json(
                { message: "You can only create attendance records for yourself" },
                { status: 403 }
            );
        }

        // Check if there's already an attendance record for today
        const today = date ? new Date(date) : new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const existingAttendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(targetUserId),
            date: { $gte: today, $lte: todayEnd },
        });

        if (existingAttendance) {
            // Update existing record if login time is not set
            if (!existingAttendance.loginTime) {
                existingAttendance.loginTime = loginTime ? new Date(loginTime) : new Date();
                existingAttendance.status = "present";
                if (notes) {
                    existingAttendance.notes = notes;
                }
                await existingAttendance.save();

                const populated = await Attendance.findById(existingAttendance._id)
                    .populate("userId", "name email role")
                    .lean();

                return NextResponse.json(
                    { attendance: populated, message: "Attendance updated successfully" },
                    { status: 200 }
                );
            } else {
                return NextResponse.json(
                    { message: "Attendance record already exists for today" },
                    { status: 400 }
                );
            }
        }

        // Create new attendance record
        const attendance = await Attendance.create({
            userId: new mongoose.Types.ObjectId(targetUserId),
            loginTime: loginTime ? new Date(loginTime) : new Date(),
            date: today,
            status: "present",
            notes: notes || undefined,
        });

        const populated = await Attendance.findById(attendance._id)
            .populate("userId", "name email role")
            .lean();

        return NextResponse.json(
            { attendance: populated, message: "Attendance created successfully" },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create attendance error:", error);
        return NextResponse.json(
            { message: "Failed to create attendance" },
            { status: 500 }
        );
    }
}

