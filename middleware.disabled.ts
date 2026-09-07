import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function homeForRole(role: string | undefined | null) {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/developer";
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value ?? "developer";

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ["/developer", "/admin", "/staff", "/settings"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  if (pathname.startsWith("/staff") && role !== "staff") {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  if (pathname.startsWith("/developer") && role !== "developer") {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/developer/:path*", "/admin/:path*", "/staff/:path*", "/settings/:path*", "/login"],
};