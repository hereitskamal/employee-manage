// app/api/sales/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { resolveRouteParams, type RouteContext } from "@/types/nextjs";

/**
 * GET /api/sales/:id
 * Fetch a single sale by ID
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
            return NextResponse.json({ message: "Invalid sale ID" }, { status: 400 });
        }

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        const query: Record<string, unknown> = { _id: id };
        
        // Employees can only see their own sales
        if (!isPrivileged) {
            query.soldBy = new mongoose.Types.ObjectId(session.user.id);
        }

        const sale = await Sale.findOne(query)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo image")
            .lean();

        if (!sale) {
            return NextResponse.json({ message: "Sale not found" }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (error) {
        console.error("Fetch sale error:", error);
        return NextResponse.json(
            { message: "Failed to fetch sale" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/sales/:id
 * Update sale (admin & manager only, or employee updating their own sale)
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
            return NextResponse.json({ message: "Invalid sale ID" }, { status: 400 });
        }

        const body = await req.json();
        const { products, saleDate, status } = body;

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        const query: Record<string, unknown> = { _id: id };
        
        // Employees can only update their own sales
        if (!isPrivileged) {
            query.soldBy = new mongoose.Types.ObjectId(session.user.id);
        }

        const sale = await Sale.findOne(query);
        if (!sale) {
            return NextResponse.json({ message: "Sale not found" }, { status: 404 });
        }

        // Only allow status updates for non-privileged users
        if (!isPrivileged && status && status !== sale.status) {
            return NextResponse.json(
                { message: "You can only update status of your own sales" },
                { status: 403 }
            );
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
                    if (!productExists) {
                        return NextResponse.json(
                            { message: `Product not found` },
                            { status: 404 }
                        );
                    }
                    return NextResponse.json(
                        { message: `Insufficient stock for product. Available: ${productExists.stock}, Requested: ${product.quantity}` },
                        { status: 400 }
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
                return NextResponse.json(
                    { message: "Only admins and managers can update products" },
                    { status: 403 }
                );
            }

            // Store old products for stock restoration
            const oldProducts = sale.products;
            const wasCompleted = oldStatus === "completed";

            // Validate and recalculate
            let totalAmount = 0;
            for (const product of products) {
                if (!product.productId || !product.quantity || product.price == null) {
                    return NextResponse.json(
                        { message: "Each product must have productId, quantity, and price" },
                        { status: 400 }
                    );
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
                        return NextResponse.json(
                            { message: `Product ${product.productId} not found` },
                            { status: 404 }
                        );
                    }

                    // Calculate net quantity change for this product
                    const oldProduct = oldProducts.find(
                        (p: { productId: mongoose.Types.ObjectId }) => p.productId.toString() === product.productId
                    );
                    const oldQuantity = oldProduct && wasCompleted ? oldProduct.quantity : 0;
                    const netQuantityChange = product.quantity - oldQuantity;

                    if (netQuantityChange > 0 && productDoc.stock < netQuantityChange) {
                        return NextResponse.json(
                            { message: `Insufficient stock for product ${productDoc.name}. Available: ${productDoc.stock}, Additional needed: ${netQuantityChange}` },
                            { status: 400 }
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

        sale.updatedBy = session.user.id ? new mongoose.Types.ObjectId(session.user.id) : undefined;
        await sale.save();

        const updatedSale = await Sale.findById(sale._id)
            .populate("soldBy", "name email")
            .populate("products.productId", "name brand category modelNo")
            .lean();

        return NextResponse.json({
            sale: updatedSale,
            message: "Sale updated successfully",
        });
    } catch (error) {
        console.error("Update sale error:", error);
        return NextResponse.json(
            { message: "Failed to update sale" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/sales/:id
 * Delete sale (admin & manager only)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        if (!isPrivileged) {
            return NextResponse.json(
                { message: "Only admins and managers can delete sales" },
                { status: 403 }
            );
        }

        const params = await resolveRouteParams(context);
        const id = params.id || "";

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid sale ID" }, { status: 400 });
        }

        await connectToDB();

        const sale = await Sale.findById(id);
        if (!sale) {
            return NextResponse.json({ message: "Sale not found" }, { status: 404 });
        }

        // Restore product stock only for completed sales
        // Stock is only deducted for completed sales, so only restore for completed sales
        if (sale.status === "completed") {
            for (const product of sale.products) {
                await Product.findByIdAndUpdate(product.productId, {
                    $inc: { stock: product.quantity },
                });
            }
        }

        await Sale.findByIdAndDelete(id);

        return NextResponse.json({ message: "Sale deleted successfully" });
    } catch (error) {
        console.error("Delete sale error:", error);
        return NextResponse.json(
            { message: "Failed to delete sale" },
            { status: 500 }
        );
    }
}

