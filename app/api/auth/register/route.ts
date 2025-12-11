// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 *
 * Handles user registration using credentials-based authentication.
 * 
 * Responsibilities:
 *  - Validate request body
 *  - Check for existing user
 *  - Hash password securely
 *  - Create a new user with default role + flags
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        /**
         * ---------------------------------------------------------
         * 1. INPUT VALIDATION
         * ---------------------------------------------------------
         */
        if (!name || !name.trim()) {
            return NextResponse.json(
                { message: "Name is required" },
                { status: 400 }
            );
        }

        if (!email || !EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { message: "Valid email is required" },
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        await connectToDB();

        /**
         * ---------------------------------------------------------
         * 2. CHECK IF USER ALREADY EXISTS
         * ---------------------------------------------------------
         */
        const existing = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (existing) {
            return NextResponse.json(
                { message: "An account already exists with this email" },
                { status: 409 }
            );
        }

        /**
         * ---------------------------------------------------------
         * 3. HASH THE PASSWORD
         * ---------------------------------------------------------
         */
        const hashedPassword = await hash(password, 12);

        /**
         * ---------------------------------------------------------
         * 4. CREATE USER RECORD
         * ---------------------------------------------------------
         * Default values:
         *  - provider: "credentials"
         *  - role: "employee"
         *  - isProfileComplete: false → requires onboarding
         *  - mustSetPassword: false → they already set password
         */
        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            provider: "credentials",
            role: "employee",
            isProfileComplete: false,
            mustSetPassword: false,
        });

        /**
         * ---------------------------------------------------------
         * 5. SUCCESS RESPONSE
         * ---------------------------------------------------------
         */
        return NextResponse.json(
            {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                message: "User registered successfully",
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Registration error:", err);

        /**
         * ---------------------------------------------------------
         * 6. GENERAL ERROR HANDLING
         * ---------------------------------------------------------
         */
        return NextResponse.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
