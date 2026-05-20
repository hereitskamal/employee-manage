// app/api/products/route.ts
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
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { success, failure } from "@/lib/apiResponse";

/**
 * =========================================================
 * ✅ GET /api/products
 * Fetch all products
 *
 * Permissions:
 *  - admin + manager → full product details
 *  - employee        → limited details (hide purchase/distributor rates)
 * =========================================================
 */
export async function GET(req: Request) {
    try {
        const session = await getSession(req);

        if (!session) return failure("Unauthorized", 401);

        await connectToDB();

        const isPrivileged =
            session.role === "admin" || session.role === "manager";

        const products = await Product.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 })
            .lean();

        if (!isPrivileged) {
            for (const p of products) {
                const product = p as Record<string, unknown>;
                delete product.purchaseRate;
                delete product.distributorRate;
            }
        }

        return success({ products });

    } catch (error) {
        console.error("Fetch products error:", error);
        return failure("Failed to fetch products", 500);
    }
}

/**
 * =========================================================
 * ✅ POST /api/products
 * Create a new product (Admin & Manager only)
 *
 * Required:
 *  - name
 *  - category
 *  - brand
 *  - modelNo
 *  - stock
 *  - minSaleRate
 *
 * Optional fields include:
 *  modelYear, purchaseRate, distributorRate,
 *  criticalSellScore, starRating, image, tagRate
 * =========================================================
 */
export async function POST(req: Request) {
    try {
        const session = await getSession(req);

        /**
         * ---------------------------------------------------------
         * 1. Authorization — Only admin & manager can add products
         * ---------------------------------------------------------
         */
        if (
            !session ||
            (session.role !== "admin" && session.role !== "manager")
        ) {
            return failure("Unauthorized", 401);
        }

        const body = await req.json();
        const {
            name,
            category,
            brand,
            modelNo,
            modelYear,
            image,
            images,
            description,
            sku,
            isActive,
            weight,
            dimensions,
            purchaseRate,
            distributorRate,
            minSaleRate,
            tagRate,
            starRating,
            criticalSellScore,
            stock,
        } = body;

        /**
         * ---------------------------------------------------------
         * 2. Validate required fields
         * ---------------------------------------------------------
         */
        if (!name || !category || !brand || !modelNo || stock == null || minSaleRate == null) {
            return failure("Name, category, brand, model no, stock and min sale rate are required", 400);
        }

        await connectToDB();

        /**
         * ---------------------------------------------------------
         * 3. Create product record
         * Apply defaults & type conversions as needed
         * ---------------------------------------------------------
         */
        const product = await Product.create({
            name: name.trim(),
            category: category.trim(),
            brand: brand.trim(),
            modelNo: modelNo.trim(),
            modelYear: modelYear ? Number(modelYear) : undefined,
            image: image || undefined,
            images: images && Array.isArray(images) && images.length > 0 ? images.filter((img: string) => img && img.trim()) : undefined,
            description: description?.trim() || undefined,
            sku: sku?.trim() || undefined,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
            weight: weight != null ? Number(weight) : undefined,
            dimensions: dimensions && (dimensions.length != null || dimensions.width != null || dimensions.height != null) ? {
                length: dimensions.length != null ? Number(dimensions.length) : undefined,
                width: dimensions.width != null ? Number(dimensions.width) : undefined,
                height: dimensions.height != null ? Number(dimensions.height) : undefined,
                unit: dimensions.unit || "cm",
            } : undefined,
            purchaseRate: purchaseRate != null ? Number(purchaseRate) : undefined,
            distributorRate: distributorRate != null ? Number(distributorRate) : undefined,
            minSaleRate: Number(minSaleRate),
            tagRate: tagRate != null ? Number(tagRate) : undefined,
            starRating: starRating != null ? Number(starRating) : undefined,
            criticalSellScore: criticalSellScore != null ? Number(criticalSellScore) : undefined,
            stock: Number(stock),
            createdBy: session.id ? new mongoose.Types.ObjectId(session.id) : undefined,
        });

        return success({ product }, 201);

    } catch (error) {
        console.error("Create product error:", error);
        return failure("Failed to create product", 500);
    }
}
