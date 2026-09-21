import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isAdminAuthRoute =
    nextUrl.pathname.startsWith("/admin/login") ||
    nextUrl.pathname.startsWith("/admin/register");
  const isAdminRoute =
    nextUrl.pathname.startsWith("/admin") && !isAdminAuthRoute;
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    isAdminAuthRoute;
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiRoute) return NextResponse.next();

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Protect student dashboard routes
  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
