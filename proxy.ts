import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;
    const protectedRoutes = ["/dashboard", "/events", "/announcements", "/meetings", "/members", "/profile", "/admin", "/api"];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // A deleted Auth user may keep an issued JWT until expiry. Require a live
    // profile for protected pages and APIs so deleted users cannot keep access.
    if (isProtectedRoute && user) {
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (!error && !profile) {
            await supabase.auth.signOut({ scope: "local" });
            const redirect = NextResponse.redirect(new URL("/signin?accountDeleted=1", request.url));
            response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie.name, cookie.value));
            return redirect;
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/events/:path*",
        "/announcements/:path*",
        "/meetings/:path*",
        "/members/:path*",
        "/profile/:path*",
        "/admin/:path*",
        "/api/:path*",
    ],
};
