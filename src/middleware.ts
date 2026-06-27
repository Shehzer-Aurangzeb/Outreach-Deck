import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_NAME, verifyToken } from "@/lib/staging-auth";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that bypass Supabase auth (public pages)
const publicRoutes = ["/login", "/auth/callback", "/protected/login"];

/**
 * Routes that bypass staging password protection.
 * Includes: login flow, Next.js internals, static assets, health checks.
 */
const stagingAllowList = [
  "/protected/login",
  "/_next",
  "/favicon.ico",
  "/health",
];

/**
 * Check if a path should bypass staging password protection.
 */
function isStagingAllowed(pathname: string): boolean {
  // Allow-listed prefixes
  if (stagingAllowList.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  // Static assets (images, fonts, etc.)
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$/i.test(pathname)) {
    return true;
  }
  return false;
}

/**
 * Staging password protection gate.
 * Uses HMAC-signed cookie (stateless, Edge-compatible).
 * Returns null if auth passes, or a Response to return early.
 */
async function checkStagingAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  // Feature toggle — skip if not enabled
  if (process.env.ENABLE_STAGING_PASSWORD !== "true") {
    return null;
  }

  const { pathname } = request.nextUrl;

  // Allow-listed routes bypass protection
  if (isStagingAllowed(pathname)) {
    return null;
  }

  const password = process.env.STAGING_PASSWORD;
  const authSecret = process.env.STAGING_AUTH_SECRET;

  // Fail closed if not configured
  if (!password || !authSecret) {
    return new NextResponse("Staging password not configured", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Check for valid staging auth cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token && (await verifyToken(token, authSecret))) {
    return null; // Auth passed
  }

  // API routes: return 401 so fetch doesn't break with redirect
  if (pathname.startsWith("/api/")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Redirect to login page with return URL
  const loginUrl = new URL("/protected/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  // Staging password protection gate — runs first
  const stagingResponse = await checkStagingAuth(request);
  if (stagingResponse) {
    return stagingResponse;
  }

  // Existing Supabase auth flow
  const { user, response } = await updateSession(request);
  const { pathname } = request.nextUrl;

  response.headers.set("x-pathname", pathname);

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return response;
  }

  if (pathname.startsWith("/api/")) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
