import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(
    request: Request,
    context: {
        params: Promise<{ id: string }>;
    }
) {
    const { id } = await context.params;

    const supabase = await createSupabaseServerClient();

    // Get currently logged-in user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(
            new URL("/signin", request.url)
        );
    }

    // Get current user's profile
    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    // Only officers can change roles
    if (currentProfile?.role !== "officer") {
        return NextResponse.redirect(
            new URL("/dashboard", request.url)
        );
    }

    // Prevent officers from changing their own role
    if (id === user.id) {
        return NextResponse.redirect(
            new URL(`/admin/users/${id}`, request.url)
        );
    }

    // Read requested role
    const formData = await request.formData();

    const requestedRole = formData.get("role");

    if (
        requestedRole !== "officer" &&
        requestedRole !== "member"
    ) {
        return NextResponse.json(
            {
                error: "Invalid role.",
            },
            {
                status: 400,
            }
        );
    }

    // Update role
    const { error } = await supabase
        .from("profiles")
        .update({
            role: requestedRole,
        })
        .eq("id", id);

    if (error) {
        console.error(
            "Role update error:",
            error.message
        );

        return NextResponse.json(
            {
                error: error.message,
            },
            {
                status: 500,
            }
        );
    }

    // Return to user management page
    return NextResponse.redirect(
        new URL(`/admin/users/${id}`, request.url)
    );
}