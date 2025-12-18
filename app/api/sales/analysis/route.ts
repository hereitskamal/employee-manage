// app/api/sales/analysis/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import mongoose from "mongoose";

/**
 * GET /api/sales/analysis
 * Get sales analytics data
 * 
 * Returns:
 *  - Revenue trends (daily/weekly/monthly)
 *  - Top selling products
 *  - Sales by employee
 *  - Sales by category
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
        const period = searchParams.get("period") || "monthly"; // daily, weekly, monthly

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        // Build date filter
        const dateFilter: Record<string, unknown> = {};
        if (startDate || endDate) {
            dateFilter.saleDate = {};
            if (startDate) {
                dateFilter.saleDate.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.saleDate.$lte = end;
            }
        }

        // Build base query
        const baseQuery: Record<string, unknown> = {
            ...dateFilter,
            status: "completed",
        };

        // Role-based filtering
        if (!isPrivileged) {
            baseQuery.soldBy = new mongoose.Types.ObjectId(session.user.id);
        }

        // Revenue trends aggregation
        let groupByFormat: string;
        switch (period) {
            case "daily":
                groupByFormat = "%Y-%m-%d";
                break;
            case "weekly":
                groupByFormat = "%Y-%U"; // Year-Week
                break;
            case "monthly":
            default:
                groupByFormat = "%Y-%m";
                break;
        }

        const revenueTrends = await Sale.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: groupByFormat,
                            date: "$saleDate",
                        },
                    },
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Top selling products
        const topProducts = await Sale.aggregate([
            { $match: baseQuery },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    totalQuantity: { $sum: "$products.quantity" },
                    totalRevenue: { $sum: "$products.subtotal" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $project: {
                    productId: "$_id",
                    productName: "$product.name",
                    productBrand: "$product.brand",
                    productCategory: "$product.category",
                    totalQuantity: 1,
                    totalRevenue: 1,
                },
            },
        ]);

        // Sales by employee
        const salesByEmployee = await Sale.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: "$soldBy",
                    totalSales: { $sum: "$totalAmount" },
                    saleCount: { $sum: 1 },
                },
            },
            { $sort: { totalSales: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employee",
                },
            },
            { $unwind: "$employee" },
            {
                $project: {
                    employeeId: "$_id",
                    employeeName: "$employee.name",
                    employeeEmail: "$employee.email",
                    totalSales: 1,
                    saleCount: 1,
                },
            },
        ]);

        // Sales by category
        const salesByCategory = await Sale.aggregate([
            { $match: baseQuery },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.category",
                    totalRevenue: { $sum: "$products.subtotal" },
                    totalQuantity: { $sum: "$products.quantity" },
                },
            },
            { $sort: { totalRevenue: -1 } },
            {
                $project: {
                    category: "$_id",
                    totalRevenue: 1,
                    totalQuantity: 1,
                },
            },
        ]);

        // Overall statistics
        const stats = await Sale.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalSales: { $sum: 1 },
                    averageSale: { $avg: "$totalAmount" },
                },
            },
        ]);

        return NextResponse.json({
            revenueTrends,
            topProducts,
            salesByEmployee,
            salesByCategory,
            stats: stats[0] || {
                totalRevenue: 0,
                totalSales: 0,
                averageSale: 0,
            },
        });

    } catch (error) {
        console.error("Sales analysis error:", error);
        return NextResponse.json(
            { message: "Failed to fetch sales analysis" },
            { status: 500 }
        );
    }
}

