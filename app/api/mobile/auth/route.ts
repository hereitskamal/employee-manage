import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400, headers: CORS }
      );
    }

    await connectToDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.provider === "google") {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401, headers: CORS }
      );
    }

    const isValid = await compare(password, user.password || "");
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401, headers: CORS }
      );
    }

    // Sign a JWT using the NextAuth secret so it's compatible
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            title: user.title,
            phone: user.phone,
            location: user.location,
            salary: user.salary,
            age: user.age,
            hireDate: user.hireDate,
            performance: user.performance,
          },
        },
      },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error("[mobile/auth] error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500, headers: CORS }
    );
  }
}
