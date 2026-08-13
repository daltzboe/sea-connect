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
    ],
};