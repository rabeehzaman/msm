import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { canOpenPath, isOpenPath } from "@/lib/auth/access";

function hasSupabaseSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function isLocalDevelopment(request: NextRequest) {
  return (
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1", "::1"].includes(request.nextUrl.hostname)
  );
}

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

  let user = null;
  let authUnavailable = false;

  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch (error) {
    authUnavailable = true;
    console.warn("Supabase auth check failed in middleware", error);
  }

  if (
    authUnavailable &&
    (hasSupabaseSessionCookie(request) || isLocalDevelopment(request))
  ) {
    return supabaseResponse;
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && !isOpenPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    try {
      const [row] = await db
        .select({ role: appUsers.role, isActive: appUsers.isActive })
        .from(appUsers)
        .where(eq(appUsers.userId, user.id))
        .limit(1);
      if (!row?.role || !row.isActive) {
        url.pathname = "/no-access";
        return NextResponse.redirect(url);
      }
      if (!canOpenPath(row.role, request.nextUrl.pathname)) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // The dashboard layout checks the role again on the server, so a failed lookup
      // here does not let anyone without a role in and does not lock out real users.
      console.warn("Role check failed in middleware", error);
    }
  }

  return supabaseResponse;
}
