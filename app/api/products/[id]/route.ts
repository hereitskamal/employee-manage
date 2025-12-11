// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";
import mongoose from "mongoose";

/**
 * =========================================================
 * ✅ GET /api/products/:id
 * Fetch a single product by ID
 *
 * Permissions:
 *  - admin/manager → full details
 *  - others        → hide purchaseRate & distributorRate
 * =========================================================
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Must be logged in
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
        }

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        const productDoc = await Product.findById(id)
            .populate("createdBy", "name email")
            .lean();

        if (!productDoc) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        // Hide sensitive pricing fields for non-privileged users
        if (!isPrivileged) {
            delete (productDoc as any).purchaseRate;
            delete (productDoc as any).distributorRate;
        }

        return NextResponse.json(productDoc);
    } catch (error) {
        console.error("Fetch product error:", error);
        return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
    }
}

/**
 * =========================================================
 * ✅ PUT /api/products/:id
 * Update product (admin & manager only)
 *
 * Flow:
 *  1. Validate session & ID
 *  2. Load product
 *  3. Apply provided updates (type conversions)
 *  4. Save & return updated product
 * =========================================================
 */
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Authorization — only admin & manager allowed
        if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
        }

        const body = await req.json();
        const {
            name,
            category,
            brand,
            modelNo,
            modelYear,
            image,
            purchaseRate,
            distributorRate,
            minSaleRate,
            tagRate,
            starRating,
            criticalSellScore,
            stock,
        } = body;

        await connectToDB();

        // Load product
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        /**
         * ---------------------------------------------------------
         * Apply updates only when values are provided
         * Use explicit conversions to Number where appropriate
         * ---------------------------------------------------------
         */
        if (name) product.name = name;
        if (category) product.category = category;
        if (brand) product.brand = brand;
        if (modelNo) product.modelNo = modelNo;
        if (modelYear != null) product.modelYear = Number(modelYear);
        if (image != null) product.image = image;
        if (purchaseRate != null) product.purchaseRate = Number(purchaseRate);
        if (distributorRate != null) product.distributorRate = Number(distributorRate);
        if (minSaleRate != null) product.minSaleRate = Number(minSaleRate);
        if (tagRate != null) product.tagRate = Number(tagRate);
        if (starRating != null) product.starRating = Number(starRating);
        if (criticalSellScore != null) product.criticalSellScore = Number(criticalSellScore);
        if (stock != null) product.stock = Number(stock);

        // Track updater
        product.updatedBy = (session.user as any).id;

        await product.save();

        return NextResponse.json({ product, message: "Product updated successfully" });
    } catch (error) {
        console.error("Update product error:", error);
        return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
    }
}

/**
 * =========================================================
 * ✅ DELETE /api/products/:id
 * Delete product (admin & manager only)
 * =========================================================
 */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Authorization — only admin & manager allowed
        if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
        }

        await connectToDB();

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Product deleted successfully", deletedId: id });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
    }
}
