// app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";
import { resolveRouteParams, type RouteContext } from "@/types/nextjs";
import { employeeUpdateSchema, formatValidationError } from "@/lib/validators";
import { ZodError } from "zod";
import { success, failure } from "@/lib/apiResponse";
import { logAudit, getUserIdFromSession } from "@/lib/audit";

/**
 * =========================================================
 * ✅ GET /api/employees/:id
 * Fetch a single employee by ID (Admin or authenticated user)
 * =========================================================
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    // Must be logged in
    if (!session) {
      return failure("Unauthorized", 401);
    }

    const params = await resolveRouteParams(context);
    const id = params.id || "";

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return failure("Invalid employee ID", 400);
    }

    await connectToDB();

    const employee = await User.findById(id)
      .select("-password")
      .populate("createdBy", "name email");

    if (!employee) {
      return failure("Employee not found", 404);
    }

    return success(employee);
  } catch (error) {
    console.error("Fetch employee error:", error);
    return failure("Failed to fetch employee", 500);
  }
}

/**
 * =========================================================
 * ✅ PUT /api/employees/:id
 * Update employee details
 * =========================================================
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    // Optional: enable only admin updates
    // if (!session || session.user.role !== "admin") {
    //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    const params = await resolveRouteParams(context);
    const id = params.id || "";

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    /**
     * ---------------------------------------------------------
     * 1. Validate Request Body with Zod
     * ---------------------------------------------------------
     */
    let validatedData;
    try {
      validatedData = employeeUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: formatValidationError(error) },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      department,
      title,
      salary,
      hireDate,
      location,
      age,
      performance,
      role,
    } = validatedData;

    await connectToDB();

    const employee = await User.findById(id);

    // Protect admin accounts + missing users
    if (!employee || employee.role === "admin") {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    /**
     * ---------------------------------------------------------
     * 1. Email change requires uniqueness check
     * ---------------------------------------------------------
     */
    if (email && email.toLowerCase() !== employee.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        );
      }
      employee.email = email.toLowerCase();
    }

    /**
     * ---------------------------------------------------------
     * 2. Update fields (only when provided)
     * ---------------------------------------------------------
     */
    if (name) employee.name = name;
    if (phone) employee.phone = phone;
    if (department) employee.department = department;
    if (title) employee.title = title;
    if (salary !== undefined) employee.salary = Number(salary);
    if (hireDate) employee.hireDate = new Date(hireDate);
    if (location) employee.location = location;
    if (age !== undefined) employee.age = Number(age);
    if (performance !== undefined) employee.performance = Number(performance);

    // Do not allow promoting/demoting admin roles here
    if (role && role !== "admin") employee.role = role;

    /**
     * ---------------------------------------------------------
     * 3. Recalculate profile completeness
     * ---------------------------------------------------------
     */
    const requiredFields = [
      employee.phone,
      employee.department,
      employee.title,
      employee.hireDate,
    ];

    employee.isProfileComplete = requiredFields.every(Boolean);

    await employee.save();

    /**
     * ---------------------------------------------------------
     * Log Audit Event (non-blocking)
     * ---------------------------------------------------------
     */
    const changedFields = Object.keys(validatedData);
    logAudit({
      userId: getUserIdFromSession(session) || id,
      action: "update",
      resource: "employee",
      resourceId: id,
      metadata: {
        changedFields,
        previousEmail: employee.email,
        newEmail: email ? email.toLowerCase() : employee.email,
      },
    });

    return NextResponse.json({
      employee,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json(
      { message: "Failed to update employee" },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * ✅ DELETE /api/employees/:id
 * Delete an employee (admin only)
 * =========================================================
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await resolveRouteParams(context);
    const id = params.id || "";

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    await connectToDB();

    const employee = await User.findById(id);

    // Do not delete admins + ensure existence
    if (!employee || employee.role === "admin") {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Store employee info before deletion for audit log
    const deletedEmployeeInfo = {
      name: employee.name,
      email: employee.email,
      department: employee.department,
    };

    await User.findByIdAndDelete(id);

    /**
     * ---------------------------------------------------------
     * Log Audit Event (non-blocking)
     * ---------------------------------------------------------
     */
    logAudit({
      userId: getUserIdFromSession(session) || id,
      action: "delete",
      resource: "employee",
      resourceId: id,
      metadata: deletedEmployeeInfo,
    });

    return NextResponse.json({
      message: "Employee deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json(
      { message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
