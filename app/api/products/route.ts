// app/api/products/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";

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
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Must be logged in
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDB();

        const isPrivileged =
            session.user.role === "admin" || session.user.role === "manager";

        const products = await Product.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 })
            .lean();

        /**
         * ---------------------------------------------------------
         * Limit pricing visibility for non-admin/manager roles
         * ---------------------------------------------------------
         */
        if (!isPrivileged) {
            for (const p of products) {
                delete (p as any).purchaseRate;
                delete (p as any).distributorRate;
            }
        }

        return NextResponse.json(products);

    } catch (error) {
        console.error("Fetch products error:", error);

        return NextResponse.json(
            { message: "Failed to fetch products" },
            { status: 500 }
        );
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
        const session = await getServerSession(authOptions);

        /**
         * ---------------------------------------------------------
         * 1. Authorization — Only admin & manager can add products
         * ---------------------------------------------------------
         */
        if (
            !session ||
            (session.user.role !== "admin" && session.user.role !== "manager")
        ) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
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

        /**
         * ---------------------------------------------------------
         * 2. Validate required fields
         * ---------------------------------------------------------
         */
        if (!name || !category || !brand || !modelNo || stock == null || minSaleRate == null) {
            return NextResponse.json(
                {
                    message:
                        "Name, category, brand, model no, stock and min sale rate are required",
                },
                { status: 400 }
            );
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
            image,
            purchaseRate: purchaseRate != null ? Number(purchaseRate) : undefined,
            distributorRate: distributorRate != null ? Number(distributorRate) : undefined,
            minSaleRate: Number(minSaleRate),
            tagRate: tagRate != null ? Number(tagRate) : undefined,
            starRating: starRating != null ? Number(starRating) : undefined,
            criticalSellScore: criticalSellScore != null ? Number(criticalSellScore) : undefined,
            stock: Number(stock),
            createdBy: (session.user as any).id,
        });

        return NextResponse.json(
            { product, message: "Product created successfully" },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create product error:", error);

        return NextResponse.json(
            { message: "Failed to create product" },
            { status: 500 }
        );
    }
}
