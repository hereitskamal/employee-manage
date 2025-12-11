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
        } as any;
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

        (user as any).id = existing._id.toString();
        (user as any).role = existing.role;
        (user as any).isProfileComplete = existing.isProfileComplete ?? false;
        (user as any).mustSetPassword = existing.mustSetPassword ?? false;
      }

      return true;
    },

    // put flags on the token at sign-in
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? token.id;
        token.role = (user as any).role ?? token.role;
        token.isProfileComplete =
          (user as any).isProfileComplete ?? token.isProfileComplete ?? false;
        token.mustSetPassword =
          (user as any).mustSetPassword ?? token.mustSetPassword ?? false;
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
        (session.user as any).id = dbUser._id.toString();
        (session.user as any).role = dbUser.role;
        (session.user as any).isProfileComplete =
          dbUser.isProfileComplete ?? false;
        (session.user as any).mustSetPassword =
          dbUser.mustSetPassword ?? false;
      } else {
        // fallback to token if DB user missing
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isProfileComplete =
          (token as any).isProfileComplete ?? false;
        (session.user as any).mustSetPassword =
          (token as any).mustSetPassword ?? false;
      }

      return session;
    },
  },
};
