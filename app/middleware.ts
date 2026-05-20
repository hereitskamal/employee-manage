// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessRoute, getDefaultDashboardRoute, type UserRole } from "@/lib/access";

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
  const isPublicApi = pathname.startsWith("/api/products/public");
  const isPublicPage = pathname === "/shop" || pathname.startsWith("/products/");
  const isPublic = isAuthPage || isApiAuth || isPublicApi || isPublicPage;

  /**
   * ---------------------------------------------------------
   * 1. UNAUTHENTICATED USERS → FORCE LOGIN (except public pages)
   * ---------------------------------------------------------
   */
  if (!token && !isPublic) {
    // Allow public shop and product pages
    if (isPublicPage) {
      return NextResponse.next();
    }
    
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
   * 3. ROLE-BASED ACCESS CONTROL
   *    Uses centralized access control definitions from lib/access.ts
   * ---------------------------------------------------------
   */
  if (token && pathname.startsWith("/dashboard")) {
    const role = token.role as UserRole | undefined;

    // Explicitly block buyers and customers from accessing dashboard
    if (role === "buyer" || role === "customer") {
      const url = req.nextUrl.clone();
      url.pathname = "/shop";
      return NextResponse.redirect(url);
    }

    // Check if user can access this route
    if (!canAccessRoute(role, pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = getDefaultDashboardRoute(role);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Matcher: Apply middleware to protected routes
 * Public routes like /shop and /products are handled in middleware logic
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/account/:path*",
    "/cart",
    "/checkout",
    "/orders/:path*",
    "/shop",
    "/products/:path*",
  ],
};
