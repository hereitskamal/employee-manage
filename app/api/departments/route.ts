import { NextResponse } from "next/server";

export async function GET() {
    const departments = [
        "Engineering",
        "HR",
        "Marketing",
        "Sales",
        "Finance",
        "IT",
        "Legal",
        "Design",
        "Product",
        "Support",
        "Operations"
    ];

    return NextResponse.json(departments);
}
