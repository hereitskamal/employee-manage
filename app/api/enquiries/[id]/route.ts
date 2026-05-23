// app/api/enquiries/[id]/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { connectToDB } from "@/lib/db";
import { Enquiry } from "@/models/Enquiry";
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

const ALLOWED_ROLES = ["admin", "manager", "spc"];

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session || !ALLOWED_ROLES.includes(session.role ?? "")) {
      return failure("Unauthorized", 401);
    }

    const params = await resolveRouteParams(context);
    const id = params.id ?? "";

    if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid enquiry ID", 400);

    await connectToDB();

    const enquiry = await Enquiry.findById(id)
      .populate("createdBy", "name role")
      .populate("callLog.loggedBy", "name")
      .lean();

    if (!enquiry) return failure("Enquiry not found", 404);

    return success({ enquiry });
  } catch (error) {
    console.error("Fetch enquiry error:", error);
    return failure("Failed to fetch enquiry", 500);
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session || !ALLOWED_ROLES.includes(session.role ?? "")) {
      return failure("Unauthorized", 401);
    }

    const params = await resolveRouteParams(context);
    const id = params.id ?? "";

    if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid enquiry ID", 400);

    const body = await req.json();
    const { status, modelName, reason, customerName, phone, category, addCallLog } = body;

    await connectToDB();

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return failure("Enquiry not found", 404);

    if (addCallLog) {
      const { outcome, confirmDate, notes } = addCallLog;
      if (!outcome) return failure("Call outcome is required", 400);

      enquiry.callLog.push({
        outcome,
        confirmDate: confirmDate ? new Date(confirmDate) : undefined,
        notes: notes?.trim() || undefined,
        calledAt: new Date(),
        loggedBy: session.id ? new mongoose.Types.ObjectId(session.id) : undefined,
      });
    } else {
      if (customerName !== undefined) enquiry.customerName = customerName.trim();
      if (phone !== undefined) enquiry.phone = phone.trim();
      if (category !== undefined) enquiry.category = category.trim();
      if (status !== undefined) enquiry.status = status;
      if (modelName !== undefined) enquiry.modelName = modelName?.trim() || undefined;
      if (reason !== undefined) enquiry.reason = reason?.trim() || undefined;
    }

    await enquiry.save();

    const updated = await Enquiry.findById(id)
      .populate("createdBy", "name role")
      .populate("callLog.loggedBy", "name")
      .lean();

    return success({ enquiry: updated });
  } catch (error) {
    console.error("Update enquiry error:", error);
    return failure("Failed to update enquiry", 500);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== "admin") {
      return failure("Unauthorized", 401);
    }

    const params = await resolveRouteParams(context);
    const id = params.id ?? "";

    if (!mongoose.Types.ObjectId.isValid(id)) return failure("Invalid enquiry ID", 400);

    await connectToDB();

    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) return failure("Enquiry not found", 404);

    return success({ deletedId: id });
  } catch (error) {
    console.error("Delete enquiry error:", error);
    return failure("Failed to delete enquiry", 500);
  }
}
