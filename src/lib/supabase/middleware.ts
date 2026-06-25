import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // getUser() handles token refresh automatically via the cookie setAll callback.
  // Only invalid/expired-unrefreshable sessions return an error with user=null.
  // Transient network errors would throw, not return an error in the response.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Only sign out if there's an auth error AND no user was returned.
  // This indicates an invalid session (expired + refresh failed), not a transient error.
  // The @supabase/ssr client handles normal token refresh via the setAll callback above.
  if (error && !user) {
    // Clear invalid session cookies
    await supabase.auth.signOut();
  }

  return { user, response: supabaseResponse };
}
