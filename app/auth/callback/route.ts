import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const requestedNext = requestUrl.searchParams.get("next") ?? "/dashboard";

    // Only allow app-relative destinations to prevent open redirects.
    const next =
        requestedNext.startsWith("/") && !requestedNext.startsWith("//")
            ? requestedNext
            : "/dashboard";

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        }
    }

    return NextResponse.redirect(
        new URL(
            "/signin?authError=" +
                encodeURIComponent("This authentication link is invalid or expired. Please request a new one."),
            requestUrl.origin
        )
    );
}
