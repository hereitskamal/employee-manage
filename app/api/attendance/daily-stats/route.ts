// app/api/attendance/daily-stats/route.ts
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
import { Sale } from "@/models/Sale";
import mongoose from "mongoose";
import { success, failure } from "@/lib/apiResponse";

export async function GET(req: Request) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        await connectToDB();

        const userId = session.id;
        if (!userId) return failure("User ID is required", 400);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: today, $lte: todayEnd },
        })
            .populate("userId", "name email role department")
            .lean();

        const salesQuery = {
            soldBy: new mongoose.Types.ObjectId(userId),
            saleDate: { $gte: today, $lte: todayEnd },
        };

        const todaySales = await Sale.find(salesQuery)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category")
            .sort({ saleDate: -1 })
            .lean();

        const salesCount = todaySales.length;
        const totalRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

        const completedSales = todaySales.filter((sale) => sale.status === "completed");
        const completedCount = completedSales.length;
        const completedRevenue = completedSales.reduce(
            (sum, sale) => sum + (sale.totalAmount || 0),
            0
        );

        return success({
            attendance: attendance || null,
            sales: {
                count: salesCount,
                completedCount,
                totalRevenue,
                completedRevenue,
                sales: todaySales.slice(0, 10),
            },
        });

    } catch (error) {
        console.error("Daily stats error:", error);
        return failure("Failed to fetch daily statistics", 500);
    }
}
