// app/api/products/meta/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";

/**
 * =========================================================
 * ✅ GET /api/products/meta
 * Fetch product metadata for filters (categories, brands)
 *
 * Permissions:
 *  - Any authenticated user can access
 *
 * Flow:
 *  1. Validate session
 *  2. Load distinct categories & brands from product collection
 *  3. Clean and sort the results
 * =========================================================
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        /**
         * ---------------------------------------------------------
         * 1. Authorization — must be logged in
         * ---------------------------------------------------------
         */
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDB();

        /**
         * ---------------------------------------------------------
         * 2. Fetch unique categories & brands
         * Using MongoDB distinct() for efficient lookups
         * ---------------------------------------------------------
         */
        const [categoriesRaw, brandsRaw] = await Promise.all([
            Product.distinct("category"),
            Product.distinct("brand"),
        ]);

        /**
         * ---------------------------------------------------------
         * 3. Clean, remove empty values, sort alphabetically
         * ---------------------------------------------------------
         */
        const categories = (categoriesRaw as string[])
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        const brands = (brandsRaw as string[])
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        return NextResponse.json({ categories, brands });

    } catch (error) {
        console.error("Products meta error:", error);

        /**
         * ---------------------------------------------------------
         * 4. Error handling
         * ---------------------------------------------------------
         */
        return NextResponse.json(
            { message: "Failed to load product filters" },
            { status: 500 }
        );
    }
}
