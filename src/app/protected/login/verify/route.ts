import { NextRequest, NextResponse } from "next/server";

import {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  createToken,
} from "@/lib/staging-auth";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const next = searchParams.get("next") ?? "/";

  // Sanitize redirect target
  const safeNext = next.startsWith("/") ? next : "/";

  const formData = await request.formData();
  const password = formData.get("password");

  const expectedPassword = process.env.STAGING_PASSWORD;
  const authSecret = process.env.STAGING_AUTH_SECRET;

  // Fail closed if not configured
  if (!expectedPassword || !authSecret) {
    return new NextResponse("Password protection not configured", {
      status: 503,
    });
  }

  // Validate password
  if (typeof password !== "string" || password !== expectedPassword) {
    const loginUrl = new URL("/protected/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", safeNext);
    return NextResponse.redirect(loginUrl, 303);
  }

  // Password correct — mint token and set cookie
  const token = await createToken(authSecret);

  const redirectUrl = new URL(safeNext, request.url);
  const response = NextResponse.redirect(redirectUrl, 303);

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
