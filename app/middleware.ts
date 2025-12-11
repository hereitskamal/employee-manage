// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = ["/login", "/register"];

/**
 * Middleware to control route-level access based on authentication and role.
 * 
 * Responsibilities:
 *  - Redirect unauthenticated users to login
 *  - Prevent authenticated users from accessing login/register pages
 *  - Enforce employee-specific route access restrictions
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname, searchParams } = req.nextUrl;

  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isApiAuth = pathname.startsWith("/api/auth");
  const isPublic = isAuthPage || isApiAuth;

  /**
   * ---------------------------------------------------------
   * 1. UNAUTHENTICATED USERS → FORCE LOGIN
   * ---------------------------------------------------------
   */
  if (!token && !isPublic) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";

    const callbackUrl =
      pathname === "/"
        ? "/"
        : `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  /**
   * ---------------------------------------------------------
   * 2. AUTHENTICATED USERS → BLOCK ACCESS TO LOGIN/REGISTER
   * ---------------------------------------------------------
   */
  if (token && isAuthPage) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.searchParams.delete("callbackUrl");
    return NextResponse.redirect(homeUrl);
  }

  /**
   * ---------------------------------------------------------
   * 3. ROLE-BASED ACCESS CONTROL FOR EMPLOYEES
   *    Employees can access ONLY: /dashboard/products
   * ---------------------------------------------------------
   */
  if (token) {
    const role = (token as any).role;

    const isEmployee = role === "employee" || role === "helper";
    const isDashboard = pathname.startsWith("/dashboard");
    const isProducts = pathname.startsWith("/dashboard/products");

    // Redirect employees trying to access forbidden dashboard routes
    if (isEmployee && isDashboard && !isProducts) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/products";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Matcher: Apply middleware ONLY to dashboard & auth pages
 */
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
