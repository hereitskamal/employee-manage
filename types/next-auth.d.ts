// types/next-auth.d.ts
import "next-auth";
import { DefaultSession } from "next-auth";

export type UserRole = "admin" | "manager" | "employee" | "spc";

declare module "next-auth" {

  interface Session {
    user: {
      id: string;
      role: UserRole;
      isProfileComplete: boolean;
      mustSetPassword: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    isProfileComplete: boolean;
    mustSetPassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    isProfileComplete?: boolean;
    mustSetPassword?: boolean;
  }
}
