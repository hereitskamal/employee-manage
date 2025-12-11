// app/api/profile/complete/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";
import { hash } from "bcryptjs";

/**
 * =========================================================
 * ✅ POST /api/profile/complete
 * Complete or update the logged-in user's profile
 *
 * Purpose:
 *  - Used by employees on first login to complete missing fields
 *  - Optional: allow password setup (for first-time login temp password)
 *
 * Flow:
 *  1. Validate session
 *  2. Load user by email
 *  3. Update profile fields selectively
 *  4. If password provided → hash & update
 *  5. Mark profile as complete if all required fields exist
 * =========================================================
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    /**
     * ---------------------------------------------------------
     * 1. Authorization — must be logged in
     * ---------------------------------------------------------
     */
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      phone,
      department,
      title,
      salary,
      hireDate,
      location,
      age,
      performance,
      password, // optional
    } = body;

    await connectToDB();

    /**
     * ---------------------------------------------------------
     * 2. Load user by email (session ensures correctness)
     * ---------------------------------------------------------
     */
    const user = await User.findOne({
      email: session.user.email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    /**
     * ---------------------------------------------------------
     * 3. Update profile fields (only if provided)
     * ---------------------------------------------------------
     */
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (title) user.title = title;
    if (salary !== undefined) user.salary = Number(salary);
    if (hireDate) user.hireDate = new Date(hireDate);
    if (location) user.location = location;
    if (age !== undefined) user.age = Number(age);
    if (performance !== undefined) user.performance = Number(performance);

    /**
     * ---------------------------------------------------------
     * 4. Password update (optional)
     * Used for first-time login after receiving temp password
     * ---------------------------------------------------------
     */
    if (password) {
      const hashed = await hash(password, 12);

      user.password = hashed;
      user.provider = "credentials";
      user.mustSetPassword = false; // no longer required after setting password
    }

    /**
     * ---------------------------------------------------------
     * 5. Determine whether profile is fully completed
     * ---------------------------------------------------------
     */
    const required = [
      user.phone,
      user.department,
      user.title,
      user.hireDate,
    ];

    if (required.every(Boolean)) {
      user.isProfileComplete = true;
    }

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.error("Complete profile error:", error);

    /**
     * ---------------------------------------------------------
     * 6. Error handling
     * ---------------------------------------------------------
     */
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
