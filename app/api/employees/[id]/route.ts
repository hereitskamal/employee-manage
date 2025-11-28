import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "employees.json");
function readEmployees() {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

// GET /api/employees/:id  → Fetch single employee
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const employees = readEmployees();

    const employeeId = Number(id);
    const employee = employees.find((e: any) => e.id === employeeId);

    // console.log({ id: employeeId, params });

    if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
}

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const employees = readEmployees();

        const employeeId = Number(id);
        const employeeIndex = employees.findIndex((e: any) => e.id === employeeId);

        console.log({ deleteId: employeeId });

        if (employeeIndex === -1) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        const updatedEmployees = employees.filter((_: any, index: number) => index !== employeeIndex);

        fs.writeFileSync(filePath, JSON.stringify(updatedEmployees, null, 2), "utf8");

        return NextResponse.json({
            message: "Employee deleted successfully",
            deletedId: employeeId
        }, { status: 200 });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
    }
}
