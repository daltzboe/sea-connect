import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
    try {
        const { user, profile } = await getCurrentProfile();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (profile?.role !== "officer" || !profile.primary_school_id) {
            return NextResponse.json({ error: "Campus officer access required." }, { status: 403 });
        }

        const body = await request.json();
        const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
        const country = typeof body.country === "string" ? body.country : "";
        const position = typeof body.position === "string" ? body.position.trim() : "";
        const bio = typeof body.bio === "string" ? body.bio.trim() : "";

        if (!fullName || !country || !position) {
            return NextResponse.json({ error: "Name, country, and position are required." }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();
        const { data: member, error } = await supabase
            .from("members")
            .insert({
                school_id: profile.primary_school_id,
                full_name: fullName,
                country,
                position,
                bio: bio || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Could not add campus member:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, member });
    } catch (error) {
        console.error("Add campus member failed:", error);
        return NextResponse.json({ error: "Could not add this member." }, { status: 500 });
    }
}
