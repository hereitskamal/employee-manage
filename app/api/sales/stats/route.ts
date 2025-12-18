// app/api/sales/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import mongoose from "mongoose";

/**
 * GET /api/sales/stats
 * Get summary statistics for sales
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDB();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        // Build date filter
        const dateFilter: Record<string, unknown> = {};
        if (startDate || endDate) {
            const saleDateFilter: { $gte?: Date; $lte?: Date } = {};
            if (startDate) {
                saleDateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                saleDateFilter.$lte = end;
            }
            dateFilter.saleDate = saleDateFilter;
        }

        // Build base query
        const baseQuery: Record<string, unknown> = {
            ...dateFilter,
        };

        // Role-based filtering
        if (!isPrivileged) {
            baseQuery.soldBy = new mongoose.Types.ObjectId(session.user.id);
        }

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const todayQuery = {
            ...baseQuery,
            saleDate: { $gte: today, $lte: todayEnd },
            status: "completed",
        };

        // This week's stats
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(todayEnd);

        const weekQuery = {
            ...baseQuery,
            saleDate: { $gte: weekStart, $lte: weekEnd },
            status: "completed",
        };

        // This month's stats
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthQuery = {
            ...baseQuery,
            saleDate: { $gte: monthStart, $lte: monthEnd },
            status: "completed",
        };

        // Overall stats
        const overallQuery = {
            ...baseQuery,
            status: "completed",
        };

        const [todayStats, weekStats, monthStats, overallStats] = await Promise.all([
            Sale.aggregate([
                { $match: todayQuery },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$totalAmount" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Sale.aggregate([
                { $match: weekQuery },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$totalAmount" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Sale.aggregate([
                { $match: monthQuery },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$totalAmount" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Sale.aggregate([
                { $match: overallQuery },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$totalAmount" },
                        count: { $sum: 1 },
                        average: { $avg: "$totalAmount" },
                    },
                },
            ]),
        ]);

        return NextResponse.json({
            today: {
                revenue: todayStats[0]?.revenue || 0,
                count: todayStats[0]?.count || 0,
            },
            week: {
                revenue: weekStats[0]?.revenue || 0,
                count: weekStats[0]?.count || 0,
            },
            month: {
                revenue: monthStats[0]?.revenue || 0,
                count: monthStats[0]?.count || 0,
            },
            overall: {
                revenue: overallStats[0]?.revenue || 0,
                count: overallStats[0]?.count || 0,
                average: overallStats[0]?.average || 0,
            },
        });

    } catch (error) {
        console.error("Sales stats error:", error);
        return NextResponse.json(
            { message: "Failed to fetch sales stats" },
            { status: 500 }
        );
    }
}

