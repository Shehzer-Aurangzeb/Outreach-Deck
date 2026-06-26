import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Track cookies set during auth to add them to the redirect response.
  // This is critical for mobile: the redirect response MUST carry Set-Cookie
  // headers, otherwise session cookies are lost in webviews/in-app browsers.
  const cookieStore = await cookies();
  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options: options ?? {} });
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignored in Route Handler context
            }
          });
        },
      },
    }
  );

  // Helper to create redirect with session cookies attached
  const redirectWithCookies = (url: string) => {
    const response = NextResponse.redirect(url);
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  };

  // Handle token_hash flow (email confirmation, magic link via token)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return redirectWithCookies(`${origin}${next}`);
    }
    console.error("Auth callback verifyOtp error:", error.message, { type, token_hash: token_hash.slice(0, 8) + "..." });
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Handle PKCE code flow (magic link via code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectWithCookies(`${origin}${next}`);
    }
    console.error("Auth callback exchange error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  console.error("Auth callback: no token_hash or code provided", { searchParams: Object.fromEntries(searchParams) });
  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}