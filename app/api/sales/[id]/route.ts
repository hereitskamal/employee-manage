// app/api/sales/[id]/route.ts
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
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { resolveRouteParams, type RouteContext } from "@/types/nextjs";
import { success, failure } from "@/lib/apiResponse";

/**
 * GET /api/sales/:id
 * Fetch a single sale by ID
 */
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid sale ID", 400);

        await connectToDB();

        const isPrivileged = session.role === "admin" || session.role === "manager";
        const query: Record<string, unknown> = { _id: id };
        if (!isPrivileged) query.soldBy = new mongoose.Types.ObjectId(session.id);

        const sale = await Sale.findOne(query)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo image")
            .lean();

        if (!sale) return failure("Sale not found", 404);

        return success({ sale });
    } catch (error) {
        console.error("Fetch sale error:", error);
        return failure("Failed to fetch sale", 500);
    }
}

/**
 * PUT /api/sales/:id
 * Update sale (admin & manager only, or employee updating their own sale)
 */
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid sale ID", 400);

        const body = await req.json();
        const { products, saleDate, status } = body;

        await connectToDB();

        const isPrivileged =
            session.role === "admin" || session.role === "manager";

        const query: Record<string, unknown> = { _id: id };
        
        // Employees can only update their own sales
        if (!isPrivileged) {
            query.soldBy = new mongoose.Types.ObjectId(session.id);
        }

        const sale = await Sale.findOne(query);
        if (!sale) return failure("Sale not found", 404);

        if (!isPrivileged && status && status !== sale.status) {
            return failure("You can only update status of your own sales", 403);
        }

        // Track status change for stock management
        const oldStatus = sale.status;
        const newStatus = status || sale.status;
        const wasCompleted = oldStatus === "completed";
        const willBeCompleted = newStatus === "completed";
        const statusChangedToCompleted = !wasCompleted && willBeCompleted;
        const statusChangedFromCompleted = wasCompleted && !willBeCompleted;

        // Update fields
        if (saleDate) {
            sale.saleDate = new Date(saleDate);
        }
        if (status) {
            sale.status = status;
        }

        // Handle stock when status changes from non-completed to completed
        if (statusChangedToCompleted) {
            // Need to deduct stock for all products
            for (const product of sale.products) {
                const productId = product.productId;
                
                // Use atomic operation to check and reserve stock
                const productDoc = await Product.findOneAndUpdate(
                    {
                        _id: productId,
                        stock: { $gte: product.quantity },
                    },
                    {
                        $inc: { stock: -product.quantity },
                    },
                    { new: true }
                );

                if (!productDoc) {
                    const productExists = await Product.findById(productId);
                    if (!productExists) return failure("Product not found", 404);
                    return failure(
                        `Insufficient stock for product. Available: ${productExists.stock}, Requested: ${product.quantity}`,
                        400
                    );
                }
            }
        }

        // Handle stock when status changes from completed to non-completed
        if (statusChangedFromCompleted) {
            // Restore stock for all products
            for (const product of sale.products) {
                await Product.findByIdAndUpdate(product.productId, {
                    $inc: { stock: product.quantity },
                });
            }
        }
        if (products && Array.isArray(products) && products.length > 0) {
            // Recalculate if products are updated (admin/manager only)
            if (!isPrivileged) {
                return failure("Only admins and managers can update products", 403);
            }

            // Store old products for stock restoration
            const oldProducts = sale.products;
            const wasCompleted = oldStatus === "completed";

            // Validate and recalculate
            let totalAmount = 0;
            for (const product of products) {
                if (!product.productId || !product.quantity || product.price == null) {
                    return failure("Each product must have productId, quantity, and price", 400);
                }
                totalAmount += product.quantity * product.price;
            }

            // Check stock availability for new products (only if sale is/will be completed)
            const willBeCompleted = newStatus === "completed";
            if (willBeCompleted) {
                for (const product of products) {
                    const productId = new mongoose.Types.ObjectId(product.productId);
                    const productDoc = await Product.findById(productId);
                    
                    if (!productDoc) {
                        return failure(`Product ${product.productId} not found`, 404);
                    }

                    // Calculate net quantity change for this product
                    const oldProduct = oldProducts.find(
                        (p: { productId: mongoose.Types.ObjectId }) => p.productId.toString() === product.productId
                    );
                    const oldQuantity = oldProduct && wasCompleted ? oldProduct.quantity : 0;
                    const netQuantityChange = product.quantity - oldQuantity;

                    if (netQuantityChange > 0 && productDoc.stock < netQuantityChange) {
                        return failure(
                            `Insufficient stock for product ${productDoc.name}. Available: ${productDoc.stock}, Additional needed: ${netQuantityChange}`,
                            400
                        );
                    }
                }
            }

            // Restore stock from old products (if sale was completed)
            // BUT: Skip if status change already handled stock restoration
            // (to avoid double restoration when both status and products change)
            if (wasCompleted && !statusChangedFromCompleted) {
                for (const oldProduct of oldProducts) {
                    await Product.findByIdAndUpdate(oldProduct.productId, {
                        $inc: { stock: oldProduct.quantity },
                    });
                }
            }

            // Update sale products
            sale.products = products.map((product: { productId: string; quantity: number; price: number }) => ({
                productId: new mongoose.Types.ObjectId(product.productId),
                quantity: product.quantity,
                price: product.price,
                subtotal: product.quantity * product.price,
            }));
            sale.totalAmount = totalAmount;

            // Deduct stock for new products (only if sale is/will be completed)
            if (willBeCompleted) {
                for (const product of products) {
                    const productId = new mongoose.Types.ObjectId(product.productId);
                    await Product.findByIdAndUpdate(productId, {
                        $inc: { stock: -product.quantity },
                    });
                }
            }
        }

        sale.updatedBy = session.id ? new mongoose.Types.ObjectId(session.id) : undefined;
        await sale.save();

        const updatedSale = await Sale.findById(sale._id)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo")
            .lean();

        return success({ sale: updatedSale });
    } catch (error) {
        console.error("Update sale error:", error);
        return failure("Failed to update sale", 500);
    }
}

/**
 * DELETE /api/sales/:id
 * Delete sale (admin & manager only)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const session = await getSession(req);
        if (!session) return failure("Unauthorized", 401);

        const isPrivileged = session.role === "admin" || session.role === "manager";
        if (!isPrivileged) return failure("Only admins and managers can delete sales", 403);

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid sale ID", 400);

        await connectToDB();

        const sale = await Sale.findById(id);
        if (!sale) return failure("Sale not found", 404);

        if (sale.status === "completed") {
            for (const product of sale.products) {
                await Product.findByIdAndUpdate(product.productId, {
                    $inc: { stock: product.quantity },
                });
            }
        }

        await Sale.findByIdAndDelete(id);

        return success({ message: "Sale deleted successfully" });
    } catch (error) {
        console.error("Delete sale error:", error);
        return failure("Failed to delete sale", 500);
    }
}

