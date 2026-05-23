// app/api/enquiries/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { connectToDB } from "@/lib/db";
import { Enquiry } from "@/models/Enquiry";
import mongoose from "mongoose";
import { success, failure } from "@/lib/apiResponse";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const ALLOWED_ROLES = ["admin", "manager", "spc"];

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !ALLOWED_ROLES.includes(session.role ?? "")) {
      return failure("Unauthorized", 401);
    }

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));

    await connectToDB();

    const query: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== "all") query.status = statusFilter;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .populate("createdBy", "name role")
        .populate("callLog.loggedBy", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(query),
    ]);

    return success({ enquiries, total, page, limit });
  } catch (error) {
    console.error("Fetch enquiries error:", error);
    return failure("Failed to fetch enquiries", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !ALLOWED_ROLES.includes(session.role ?? "")) {
      return failure("Unauthorized", 401);
    }

    const body = await req.json();
    const { customerName, phone, category, modelName, reason, status } = body;

    if (!customerName?.trim() || !phone?.trim() || !category?.trim()) {
      return failure("Customer name, phone, and category are required", 400);
    }

    await connectToDB();

    const enquiry = await Enquiry.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      category: category.trim(),
      modelName: modelName?.trim() || undefined,
      reason: reason?.trim() || undefined,
      status: status ?? "interested",
      callLog: [],
      createdBy: session.id ? new mongoose.Types.ObjectId(session.id) : undefined,
    });

    return success({ enquiry }, 201);
  } catch (error) {
    console.error("Create enquiry error:", error);
    return failure("Failed to create enquiry", 500);
  }
}
