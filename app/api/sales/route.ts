// app/api/sales/route.ts
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
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { isPrivileged } from "@/lib/access";
import { success, failure } from "@/lib/apiResponse";

/**
 * GET /api/sales
 * Fetch all sales with filters
 * 
 * Permissions:
 *  - admin + manager → all sales
 *  - employee        → only their own sales
 */
export async function GET(req: Request) {
    try {
        const session = await getSession(req);

        if (!session) return failure("Unauthorized", 401);

        await connectToDB();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const employeeId = searchParams.get("employeeId");
        const productId = searchParams.get("productId");
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");

        const isPrivilegedUser =
            session.role === "admin" || session.role === "manager";

        const query: Record<string, unknown> = {};

        if (!isPrivilegedUser) {
            if (!session.id || !mongoose.Types.ObjectId.isValid(session.id)) {
                return failure("Invalid user ID", 400);
            }
            query.soldBy = new mongoose.Types.ObjectId(session.id);
        } else if (employeeId) {
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                return failure("Invalid employee ID", 400);
            }
            query.soldBy = new mongoose.Types.ObjectId(employeeId);
        }

        if (startDate || endDate) {
            const dateFilter: { $gte?: Date; $lte?: Date } = {};
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            query.saleDate = dateFilter;
        }

        if (productId) {
            query["products.productId"] = new mongoose.Types.ObjectId(productId);
        }

        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const sales = await Sale.find(query)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo")
            .sort({ saleDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Sale.countDocuments(query);

        return success({
            sales,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error("Fetch sales error:", error);
        return failure("Failed to fetch sales", 500);
    }
}

/**
 * POST /api/sales
 * Create a new sale
 * 
 * Required:
 *  - products (array with productId, quantity, price)
 *  - soldBy (employee ID)
 *  - saleDate (optional, defaults to now)
 */
export async function POST(req: Request) {
    try {
        const session = await getSession(req);

        if (!session) return failure("Unauthorized", 401);

        const body = await req.json();
        const { products, soldBy, saleDate, status } = body;

        const isPrivileged =
            session.role === "admin" || session.role === "manager";

        if (!products || !Array.isArray(products) || products.length === 0) {
            return failure("At least one product is required", 400);
        }

        let targetSoldBy = soldBy || session.id;
        if (!targetSoldBy) {
            return failure("soldBy (employee ID) is required", 400);
        }

        if (!isPrivileged && targetSoldBy !== session.id) {
            return failure("You can only create sales records for yourself", 403);
        }

        for (const product of products) {
            if (!product.productId || !product.quantity || product.price == null) {
                return failure("Each product must have productId, quantity, and price", 400);
            }
            if (product.quantity <= 0) {
                return failure("Product quantity must be greater than 0", 400);
            }
        }

        await connectToDB();

        const saleStatus = status || "completed";
        const isCompleted = saleStatus === "completed";

        // Check stock availability and calculate totals
        // Only check stock if sale will be completed
        let totalAmount = 0;
        const productUpdates: Array<{ id: mongoose.Types.ObjectId; quantity: number }> = [];

        if (isCompleted) {
            for (const product of products) {
                const productId = new mongoose.Types.ObjectId(product.productId);
                
                // Use atomic operation to check and reserve stock
                const productDoc = await Product.findOneAndUpdate(
                    {
                        _id: productId,
                        stock: { $gte: product.quantity }, // Only update if stock is sufficient
                    },
                    {
                        $inc: { stock: -product.quantity },
                    },
                    { new: true }
                );

                if (!productDoc) {
                    const productExists = await Product.findById(productId);
                    if (!productExists) {
                        return failure(`Product ${product.productId} not found`, 404);
                    }
                    return failure(
                        `Insufficient stock for product ${productExists.name}. Available: ${productExists.stock}, Requested: ${product.quantity}`,
                        400
                    );
                }

                const subtotal = product.quantity * product.price;
                totalAmount += subtotal;

                productUpdates.push({
                    id: productId,
                    quantity: product.quantity,
                });
            }
        } else {
            // For non-completed sales, just calculate total without stock check
            for (const product of products) {
                const productId = new mongoose.Types.ObjectId(product.productId);
                const productDoc = await Product.findById(productId);

                if (!productDoc) {
                    return failure(`Product ${product.productId} not found`, 404);
                }

                const subtotal = product.quantity * product.price;
                totalAmount += subtotal;

                productUpdates.push({
                    id: productId,
                    quantity: product.quantity,
                });
            }
        }

        // Prepare sale products with subtotals
        const saleProducts = products.map((product: { productId: string; quantity: number; price: number }) => ({
            productId: new mongoose.Types.ObjectId(product.productId),
            quantity: product.quantity,
            price: product.price,
            subtotal: product.quantity * product.price,
        }));

        // Create sale
        const sale = await Sale.create({
            products: saleProducts,
            totalAmount,
            soldBy: new mongoose.Types.ObjectId(targetSoldBy),
            saleDate: saleDate ? new Date(saleDate) : new Date(),
            status: saleStatus,
            createdBy: session.id ? new mongoose.Types.ObjectId(session.id) : undefined,
        });

        // Stock was already updated atomically for completed sales above
        // No additional stock update needed

        // Populate and return
        const populatedSale = await Sale.findById(sale._id)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo")
            .lean();

        return success({ sale: populatedSale }, 201);

    } catch (error) {
        console.error("Create sale error:", error);
        return failure("Failed to create sale", 500);
    }
}

