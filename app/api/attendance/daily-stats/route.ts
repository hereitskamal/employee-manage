// app/api/attendance/daily-stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { Sale } from "@/models/Sale";
import mongoose from "mongoose";

/**
 * GET /api/attendance/daily-stats
 * Get today's attendance and sales statistics for the logged-in employee
 * 
 * Returns:
 *  - Today's attendance record (if exists)
 *  - Today's sales count and total revenue
 *  - Recent sales list
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

        const userId = session.user.id;
        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Fetch today's attendance record
        const attendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: today, $lte: todayEnd },
        })
            .populate("userId", "name email role department")
            .lean();

        // Fetch today's sales
        const salesQuery = {
            soldBy: new mongoose.Types.ObjectId(userId),
            saleDate: { $gte: today, $lte: todayEnd },
        };

        const todaySales = await Sale.find(salesQuery)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category")
            .sort({ saleDate: -1 })
            .lean();

        // Calculate sales statistics
        const salesCount = todaySales.length;
        const totalRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

        // Get completed sales count and revenue
        const completedSales = todaySales.filter(sale => sale.status === "completed");
        const completedCount = completedSales.length;
        const completedRevenue = completedSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

        return NextResponse.json({
            attendance: attendance || null,
            sales: {
                count: salesCount,
                completedCount,
                totalRevenue,
                completedRevenue,
                sales: todaySales.slice(0, 10), // Return up to 10 most recent sales
            },
        });

    } catch (error) {
        console.error("Daily stats error:", error);
        return NextResponse.json(
            { message: "Failed to fetch daily statistics" },
            { status: 500 }
        );
    }
}

