import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "employees.json");

function readEmployees() {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

function writeEmployees(employees: any) {
    fs.writeFileSync(filePath, JSON.stringify(employees, null, 2));
}

// GET — return all employees
export async function GET() {
    const employees = readEmployees();
    return NextResponse.json(employees);
}

// POST — add an employee
export async function POST(req: Request) {
    const newEmployee = await req.json();
    const employees = readEmployees();

    const id =
        employees.length > 0
            ? Math.max(...employees.map((e: any) => e.id)) + 1
            : 1;

    const employeeWithId = { id, ...newEmployee };
    employees.push(employeeWithId);

    writeEmployees(employees);

    return NextResponse.json(employeeWithId, { status: 201 });
}
