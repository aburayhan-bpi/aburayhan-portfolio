import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const isAuthenticated = Boolean(token && token.trim().length > 0);
  const isAdmin = userRole === "ADMIN";

  // 1. Strictly Protect Dashboard Routes
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isAuthenticated || !isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);

      // Cleanse potentially corrupted or expired cookies
      response.cookies.delete("accessToken");
      response.cookies.delete("userRole");
      response.cookies.delete("authUser");
      return response;
    }
  }

  // 2. Prevent Logged-in Admins from getting stuck on Auth pages
  if (
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    if (isAuthenticated && isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
