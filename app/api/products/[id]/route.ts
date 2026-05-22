// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { connectToDB } from "@/lib/db";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { resolveRouteParams, type RouteContext } from "@/types/nextjs";
import { success, failure } from "@/lib/apiResponse";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) return failure("Unauthorized", 401);

    const params = await resolveRouteParams(context);
    const id = params.id || "";

    if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid product ID", 400);

    await connectToDB();

    const isPrivileged = session.role === "admin" || session.role === "manager";
    const productDoc = await Product.findById(id).populate("createdBy", "name email").lean();

    if (!productDoc) return failure("Product not found", 404);

    if (!isPrivileged) {
      const doc = productDoc as Record<string, unknown>;
      delete doc.purchaseRate;
      delete doc.distributorRate;
    }

    return success({ product: productDoc });
  } catch (error) {
    console.error("Fetch product error:", error);
    return failure("Failed to fetch product", 500);
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await getSession(req);

    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return failure("Unauthorized", 401);
    }

    const params = await resolveRouteParams(context);
    const id = params.id || "";

    if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid product ID", 400);

    const body = await req.json();
    const {
      name, category, brand, modelNo, modelYear, image,
      purchaseRate, distributorRate, minSaleRate, tagRate,
      starRating, criticalSellScore, stock, description, sku,
    } = body;

    await connectToDB();

    const product = await Product.findById(id);
    if (!product) return failure("Product not found", 404);

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (modelNo !== undefined) product.modelNo = modelNo;
    if (modelYear != null) product.modelYear = Number(modelYear);
    if (image != null) product.image = image;
    if (purchaseRate != null) product.purchaseRate = Number(purchaseRate);
    if (distributorRate != null) product.distributorRate = Number(distributorRate);
    if (minSaleRate != null) product.minSaleRate = Number(minSaleRate);
    if (tagRate != null) product.tagRate = Number(tagRate);
    if (starRating != null) product.starRating = Number(starRating);
    if (criticalSellScore != null) product.criticalSellScore = Number(criticalSellScore);
    if (stock != null) product.stock = Number(stock);
    if (description !== undefined) product.description = description;
    if (sku !== undefined) product.sku = sku;

    if (session.id) product.updatedBy = new mongoose.Types.ObjectId(session.id);

    await product.save();

    return success({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return failure("Failed to update product", 500);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession(req);

    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return failure("Unauthorized", 401);
    }

    const params = await resolveRouteParams(context);
    const id = params.id || "";

    if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid product ID", 400);

    await connectToDB();

    const product = await Product.findByIdAndDelete(id);
    if (!product) return failure("Product not found", 404);

    return success({ deletedId: id });
  } catch (error) {
    console.error("Delete product error:", error);
    return failure("Failed to delete product", 500);
  }
}
