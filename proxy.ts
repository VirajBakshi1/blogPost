import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Role-aware route protection.
 *
 * /dashboard  — requires auth; if admin visits → redirect to /admin
 * /admin      — requires auth + role === "admin"; others → /dashboard
 * /login, /signup, /verify — if already authenticated → redirect to home for their role
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;
  const session = token ? verifyToken(token) : null;
  const isAuthenticated = session !== null;
  const isAdmin = session?.role === "admin";

  // ── /admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      // Non-admin users cannot access admin panel
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ── /dashboard routes ─────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isAdmin) {
      // Admin should always be in the admin panel, not dashboard
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ── Auth pages (login / signup / verify) ─────────────────────────────────
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verify";

  if (isAuthPage && isAuthenticated) {
    // Authenticated users don't need to re-auth — send to their home
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup", "/verify"],
};
