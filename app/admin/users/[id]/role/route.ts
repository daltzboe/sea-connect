import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const { user, profile } = await getCurrentProfile();

    if (!user) return NextResponse.redirect(new URL("/signin", request.url));
    if (profile?.role !== "officer" || !profile.primary_school_id) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (id === user.id) {
        return NextResponse.redirect(new URL(`/admin/users/${id}`, request.url));
    }

    const formData = await request.formData();
    const requestedRole = formData.get("role");
    if (requestedRole !== "officer" && requestedRole !== "member") {
        return NextResponse.json({ error: "Invalid campus role." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("school_memberships")
        .update({ role: requestedRole })
        .eq("school_id", profile.primary_school_id)
        .eq("user_id", id)
        .eq("status", "active")
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("Campus role update failed:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "Active membership not found for this campus." }, { status: 404 });
    }

    return NextResponse.redirect(new URL(`/admin/users/${id}`, request.url));
}
