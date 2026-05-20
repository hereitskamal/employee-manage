import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { authOptions } from "@/lib/authOptions";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Returns the authenticated user from either:
 *  - NextAuth session cookie (web / Next.js dashboard)
 *  - Bearer JWT token in Authorization header (mobile app)
 */
export async function getSession(req: Request): Promise<SessionUser | null> {
  // 1. Try NextAuth session cookie first
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    return {
      id: session.user.id ?? "",
      name: session.user.name ?? "",
      email: session.user.email,
      role: session.user.role ?? "employee",
    };
  }

  // 2. Fall back to Bearer token (mobile)
  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!bearer) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(bearer, secret);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
