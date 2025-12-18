import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { connectToDB } from "@/lib/db";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectToDB();

        const email = credentials.email.toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.provider === "google") {
          throw new Error("Please sign in with Google for this account");
        }

        // if (user.mustSetPassword) {
        //   throw new Error("Please set your password before logging in.");
        // }

        const isValid = await compare(
          credentials.password,
          user.password || ""
        );
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isProfileComplete: user.isProfileComplete ?? false,
          mustSetPassword: user.mustSetPassword ?? false,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      await connectToDB();

      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        let existing = await User.findOne({ email });

        if (!existing) {
          existing = await User.create({
            name: user.name,
            email,
            image: user.image,
            provider: "google",
            role: "employee",
            isProfileComplete: false,
            mustSetPassword: false,
          });
        }

        // Extend user object with our custom fields
        Object.assign(user, {
          id: existing._id.toString(),
          role: existing.role,
          isProfileComplete: existing.isProfileComplete ?? false,
          mustSetPassword: existing.mustSetPassword ?? false,
        });
      }

      // Track login time for attendance
      if (user.id) {
        try {
          const { Attendance } = await import("@/models/Attendance");
          const mongoose = await import("mongoose");
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);

          // Check if attendance record exists for today
          const existingAttendance = await Attendance.findOne({
            userId: new mongoose.default.Types.ObjectId(user.id),
            date: { $gte: today, $lte: todayEnd },
          });

          if (!existingAttendance) {
            // Create new attendance record
            await Attendance.create({
              userId: new mongoose.default.Types.ObjectId(user.id),
              loginTime: new Date(),
              date: today,
              status: "present",
            });
          } else if (!existingAttendance.loginTime) {
            // Update existing record with login time
            existingAttendance.loginTime = new Date();
            existingAttendance.status = "present";
            await existingAttendance.save();
          }
        } catch (error) {
          // Don't block login if attendance tracking fails
          console.error("Failed to track login attendance:", error);
        }
      }

      return true;
    },

    // put flags on the token at sign-in
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as { id?: string; role?: string; isProfileComplete?: boolean; mustSetPassword?: boolean };
        token.id = extendedUser.id ?? token.id;
        token.role = extendedUser.role as "admin" | "manager" | "employee" | "spc" | undefined ?? token.role;
        token.isProfileComplete = extendedUser.isProfileComplete ?? token.isProfileComplete ?? false;
        token.mustSetPassword = extendedUser.mustSetPassword ?? token.mustSetPassword ?? false;
      }

      return token;
    },

    // ALWAYS sync from DB so changes like complete-profile are reflected
    async session({ session, token }) {
      if (!session.user?.email) return session;

      await connectToDB();
      const dbUser = await User.findOne({
        email: session.user.email.toLowerCase(),
      });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
        session.user.isProfileComplete = dbUser.isProfileComplete ?? false;
        session.user.mustSetPassword = dbUser.mustSetPassword ?? false;
      } else {
        // fallback to token if DB user missing
        if (token.id) session.user.id = token.id;
        if (token.role) session.user.role = token.role;
        session.user.isProfileComplete = token.isProfileComplete ?? false;
        session.user.mustSetPassword = token.mustSetPassword ?? false;
      }

      return session;
    },
  },
};
