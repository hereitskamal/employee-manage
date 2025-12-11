// app/api/employees/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";

/**
 * =========================================================
 * ✅ GET /api/employees/:id
 * Fetch a single employee by ID (Admin or authenticated user)
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

        const { id } = params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid employee ID" },
                { status: 400 }
            );
        }

        await connectToDB();

        const employee = await User.findById(id)
            .select("-password")
            .populate("createdBy", "name email");

        if (!employee) {
            return NextResponse.json(
                { message: "Employee not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(employee);

    } catch (error) {
        console.error("Fetch employee error:", error);
        return NextResponse.json(
            { message: "Failed to fetch employee" },
            { status: 500 }
        );
    }
}

/**
 * =========================================================
 * ✅ PUT /api/employees/:id
 * Update employee details
 *
 * Flow:
 *  1. Validate ID
 *  2. Load employee record
 *  3. Check email uniqueness (if changed)
 *  4. Update fields selectively
 *  5. Recalculate profile completeness
 * =========================================================
 */
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Optional: enable only admin updates
        // if (!session || session.user.role !== "admin") {
        //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        // }

        const { id } = params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid employee ID" },
                { status: 400 }
            );
        }

        const body = await req.json();
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
        } = body;

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
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

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

        await User.findByIdAndDelete(id);

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
