import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const publicRoutes = ["/login", "/auth/callback"];

/**
 * Password protection gate — runs before Supabase auth.
 * Similar to Vercel's password protection (password-only, no username).
 * Returns a 401 response if password is missing/invalid.
 * Returns null if auth passes (continue to normal flow).
 */
function checkPasswordProtection(request: NextRequest): NextResponse | null {
  const password = process.env.SITE_AUTH_PASSWORD;

  // Fail safe: if env var not set, block all access.
  // This prevents accidentally exposing the site if someone forgets to set the password.
  if (!password) {
    return new NextResponse("Site password not configured", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    // Format: "Basic <base64(user:password)>" — we use empty username
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      // Edge runtime: use btoa/atob instead of Buffer
      // Empty username, password only (like Vercel's protection)
      const expected = btoa(`:${password}`);
      if (encoded === expected) {
        return null; // Auth passed, continue
      }
    }
  }

  // Missing or invalid password — prompt for login
  return new NextResponse("Password required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected Site", charset="UTF-8"',
      "Content-Type": "text/plain",
    },
  });
}

export async function middleware(request: NextRequest) {
  // Password protection gate — runs first
  const passwordResponse = checkPasswordProtection(request);
  if (passwordResponse) {
    return passwordResponse;
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
