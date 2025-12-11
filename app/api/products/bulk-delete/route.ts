// app/api/products/bulk-delete/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";
import mongoose from "mongoose";

/**
 * =========================================================
 * ✅ POST /api/products/bulk-delete
 * Bulk delete multiple products (admin & manager only)
 *
 * Flow:
 *  1. Validate session & permissions
 *  2. Validate and filter IDs
 *  3. Delete all matched products
 *  4. Return summary response
 * =========================================================
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    /**
     * ---------------------------------------------------------
     * 1. Authorization — Only admin & manager allowed
     * ---------------------------------------------------------
     */
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "manager")
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    /**
     * ---------------------------------------------------------
     * 2. Validate request body
     * Must contain non-empty array of IDs
     * ---------------------------------------------------------
     */
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "No product IDs provided" },
        { status: 400 }
      );
    }

    /**
     * ---------------------------------------------------------
     * 3. Filter valid MongoDB ObjectIds
     * ---------------------------------------------------------
     */
    const validIds = ids.filter((id: string) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        { message: "No valid product IDs provided" },
        { status: 400 }
      );
    }

    await connectToDB();

    /**
     * ---------------------------------------------------------
     * 4. Perform bulk deletion
     * ---------------------------------------------------------
     */
    const result = await Product.deleteMany({
      _id: { $in: validIds },
    });

    return NextResponse.json({
      message: "Products deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete products error:", error);

    /**
     * ---------------------------------------------------------
     * 5. Error handling
     * ---------------------------------------------------------
     */
    return NextResponse.json(
      { message: "Failed to delete products" },
      { status: 500 }
    );
  }
}
