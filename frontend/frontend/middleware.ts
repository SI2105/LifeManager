/**
 * Middleware
 * Route protection and authentication checks
 */

import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/auth", "/"];

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route));

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Get auth tokens from cookies or attempt from session storage (client-side fallback)
  const hasTokens = request.cookies.has("auth_token");

  // For client-side token checking (localStorage), we'll rely on client-side redirect
  // This middleware will only handle basic route blocking

  if (isProtectedRoute && !hasTokens) {
    // For now, we'll let the client handle auth redirects via useEffect
    // Since localStorage is client-side only
    return NextResponse.next();
  }

  if (isPublicRoute && hasTokens) {
    // User is authenticated but on auth page, let them proceed
    // The client component will handle redirect to dashboard
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
