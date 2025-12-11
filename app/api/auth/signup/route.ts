// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { hash } from "bcryptjs";

/**
 * POST /api/auth/signup
 *
 * Handles new user creation using credentials.
 *
 * Responsibilities:
 *  - Validate incoming request body
 *  - Ensure user doesn't already exist
 *  - Hash password securely
 *  - Create user with optional role (defaults to "employee")
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role = "employee" } = body;

    /**
     * ---------------------------------------------------------
     * 1. VALIDATE INPUT FIELDS
     * ---------------------------------------------------------
     */
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    /**
     * ---------------------------------------------------------
     * 2. CHECK IF USER ALREADY EXISTS
     * ---------------------------------------------------------
     */
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    /**
     * ---------------------------------------------------------
     * 3. HASH PASSWORD
     * ---------------------------------------------------------
     */
    const hashedPassword = await hash(password, 10);

    /**
     * ---------------------------------------------------------
     * 4. CREATE USER RECORD
     * ---------------------------------------------------------
     */
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    /**
     * ---------------------------------------------------------
     * 5. SUCCESS RESPONSE
     * ---------------------------------------------------------
     */
    return NextResponse.json(
      { message: "User created" },
      { status: 201 }
    );

  } catch (err) {
    console.error("Signup error:", err);

    /**
     * ---------------------------------------------------------
     * 6. ERROR HANDLING
     * ---------------------------------------------------------
     */
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
