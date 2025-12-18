// app/api/sales/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import mongoose from "mongoose";

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
        const employeeId = searchParams.get("employeeId");
        const productId = searchParams.get("productId");
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        // Build query
        const query: Record<string, unknown> = {};

        // Role-based filtering
        if (!isPrivileged) {
            // Employees can only see their own sales
            query.soldBy = new mongoose.Types.ObjectId(session.user.id);
        } else if (employeeId) {
            query.soldBy = new mongoose.Types.ObjectId(employeeId);
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
            query.saleDate = dateFilter;
        }

        // Product filter
        if (productId) {
            query["products.productId"] = new mongoose.Types.ObjectId(productId);
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const sales = await Sale.find(query)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo")
            .sort({ saleDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Sale.countDocuments(query);

        return NextResponse.json({
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
        return NextResponse.json(
            { message: "Failed to fetch sales" },
            { status: 500 }
        );
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
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { products, soldBy, saleDate, status } = body;

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        // Validate required fields
        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { message: "At least one product is required" },
                { status: 400 }
            );
        }

        // Determine the soldBy user ID
        let targetSoldBy = soldBy || session.user.id;
        if (!targetSoldBy) {
            return NextResponse.json(
                { message: "soldBy (employee ID) is required" },
                { status: 400 }
            );
        }

        // Non-privileged users can only create sales for themselves
        if (!isPrivileged && targetSoldBy !== session.user.id) {
            return NextResponse.json(
                { message: "You can only create sales records for yourself" },
                { status: 403 }
            );
        }

        // Validate products array
        for (const product of products) {
            if (!product.productId || !product.quantity || product.price == null) {
                return NextResponse.json(
                    { message: "Each product must have productId, quantity, and price" },
                    { status: 400 }
                );
            }
            if (product.quantity <= 0) {
                return NextResponse.json(
                    { message: "Product quantity must be greater than 0" },
                    { status: 400 }
                );
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
                    // Check if product exists
                    const productExists = await Product.findById(productId);
                    if (!productExists) {
                        return NextResponse.json(
                            { message: `Product ${product.productId} not found` },
                            { status: 404 }
                        );
                    }
                    // Product exists but insufficient stock
                    return NextResponse.json(
                        { message: `Insufficient stock for product ${productExists.name}. Available: ${productExists.stock}, Requested: ${product.quantity}` },
                        { status: 400 }
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
                    return NextResponse.json(
                        { message: `Product ${product.productId} not found` },
                        { status: 404 }
                    );
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
            createdBy: session.user.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
        });

        // Stock was already updated atomically for completed sales above
        // No additional stock update needed

        // Populate and return
        const populatedSale = await Sale.findById(sale._id)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo")
            .lean();

        return NextResponse.json(
            { sale: populatedSale, message: "Sale created successfully" },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create sale error:", error);
        return NextResponse.json(
            { message: "Failed to create sale" },
            { status: 500 }
        );
    }
}

