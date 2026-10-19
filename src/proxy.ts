import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const isAuthenticated = Boolean(token && token.trim().length > 0);
  const isAdmin = userRole === "ADMIN";

  // 1. Strictly Protect Dashboard Routes
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);

      // Cleanse potentially corrupted or expired cookies
      response.cookies.delete("accessToken");
      response.cookies.delete("userRole");
      response.cookies.delete("authUser");
      return response;
    }

    // Authenticated non-admins redirected to unauthorized page
    if (!isAdmin && pathname !== "/dashboard/unauthorized") {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
    }
  }

  // 2. Prevent Logged-in Users from visiting Auth pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email"
  ) {
    if (isAuthenticated) {
      const target = isAdmin ? "/dashboard/admin" : "/";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
