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
   * 3. ROLE-BASED ACCESS CONTROL
   *    Employees can access: /dashboard/products, /dashboard/sales, /dashboard/attendance, /dashboard/employee
   *    SPC can access: /dashboard/products, /dashboard/sales, /dashboard/attendance, /dashboard/spc
   *    Managers can access: most dashboard routes except admin-only
   *    Admins can access: all routes
   * ---------------------------------------------------------
   */
  if (token) {
    const role = token.role;

    const isEmployee = role === "employee";
    const isSPC = role === "spc";
    const isManager = role === "manager";
    const isAdmin = role === "admin";
    const isHelper = role === "helper";
    const isDashboard = pathname.startsWith("/dashboard");

    if (isDashboard) {
      // Admin-only routes
      const isAdminOnly = pathname.startsWith("/dashboard/admin") || 
                         pathname.startsWith("/dashboard/attendance/daily-logs") ||
                         pathname.startsWith("/dashboard/employees");
      
      // Manager/Admin-only routes (restricted from employees and SPC)
      const isManagerOnlyRoute = pathname.startsWith("/dashboard/sales/analysis");
      
      // Manager allowed routes
      const isManagerAllowed = pathname.startsWith("/dashboard/manager") ||
                               pathname.startsWith("/dashboard/products") ||
                               pathname.startsWith("/dashboard/sales") ||
                               pathname.startsWith("/dashboard/attendance") ||
                               pathname === "/dashboard";

      // Employee allowed routes (exclude sales/analysis)
      const isEmployeeAllowed = pathname.startsWith("/dashboard/products") ||
                                (pathname.startsWith("/dashboard/sales") && !pathname.startsWith("/dashboard/sales/analysis")) ||
                                pathname.startsWith("/dashboard/attendance") ||
                                pathname.startsWith("/dashboard/employee") ||
                                pathname === "/dashboard";

      // Helper allowed routes (same as employee)
      const isHelperAllowed = pathname.startsWith("/dashboard/products") ||
                             (pathname.startsWith("/dashboard/sales") && !pathname.startsWith("/dashboard/sales/analysis")) ||
                             pathname.startsWith("/dashboard/attendance") ||
                             pathname.startsWith("/dashboard/employee") ||
                             pathname === "/dashboard";

      // SPC allowed routes (exclude sales/analysis)
      const isSPCAllowed = pathname.startsWith("/dashboard/products") ||
                           (pathname.startsWith("/dashboard/sales") && !pathname.startsWith("/dashboard/sales/analysis")) ||
                           pathname.startsWith("/dashboard/attendance") ||
                           pathname.startsWith("/dashboard/spc") ||
                           pathname === "/dashboard";

      // Redirect based on role
      if (isEmployee && !isEmployeeAllowed) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard/employee";
        return NextResponse.redirect(url);
      }

      if (isHelper && !isHelperAllowed) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard/employee";
        return NextResponse.redirect(url);
      }

      if (isSPC && !isSPCAllowed) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard/spc";
        return NextResponse.redirect(url);
      }

      // Managers cannot access admin-only routes or manager-only routes they shouldn't access
      if (isManager && (isAdminOnly || pathname.startsWith("/dashboard/admin"))) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard/manager";
        return NextResponse.redirect(url);
      }

      // Employees, helpers, and SPC cannot access manager-only routes
      if ((isEmployee || isHelper || isSPC) && isManagerOnlyRoute) {
        const url = req.nextUrl.clone();
        url.pathname = isEmployee || isHelper ? "/dashboard/employee" : "/dashboard/spc";
        return NextResponse.redirect(url);
      }

      if (!isAdmin && isAdminOnly) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
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
