import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(
                        ({ name, value, options }) => {
                            request.cookies.set(name, value);
                            response.cookies.set(
                                name,
                                value,
                                options
                            );
                        }
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const protectedRoutes = [
        "/dashboard",
        "/events",
        "/announcements",
        "/meetings",
        "/members",
        "/profile",
        "/chat",
        "/notifications",
        "/admin",
    ];

    const pathname = request.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(
            new URL("/signin", request.url)
        );
    }

    if (isProtectedRoute && user) {
        const { data: isPlatformAdmin } = await supabase.rpc("is_platform_admin");

        if (!isPlatformAdmin) {
            const { data: membership, error: membershipError } = await supabase
                .from("school_memberships")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "active")
                .limit(1)
                .maybeSingle();

            if (membershipError || !membership) {
                return NextResponse.redirect(
                    new URL("/signup?school=required", request.url)
                );
            }
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
        "/chat/:path*",
        "/notifications/:path*",
        "/admin/:path*",
    ],
};