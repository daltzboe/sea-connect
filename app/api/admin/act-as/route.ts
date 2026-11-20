import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const COOKIE_NAME = "sea_admin_school_id";

export async function POST(request: Request) {
    try {
        const { user, isPlatformAdmin } = await getCurrentProfile();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!isPlatformAdmin) return NextResponse.json({ error: "Platform Admin access required." }, { status: 403 });

        const body = await request.json();
        const schoolId = typeof body.schoolId === "string" ? body.schoolId : "";
        if (!schoolId) return NextResponse.json({ error: "Choose a school first." }, { status: 400 });

        const supabase = await createSupabaseServerClient();
        const { data: school, error } = await supabase
            .from("schools")
            .select("id,name,is_listed")
            .eq("id", schoolId)
            .eq("is_listed", true)
            .maybeSingle();

        if (error || !school) {
            return NextResponse.json({ error: "That school is not available in the test directory." }, { status: 404 });
        }

        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, school.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8,
        });

        return NextResponse.json({ success: true, schoolName: school.name });
    } catch (error) {
        console.error("Could not enter campus admin view:", error);
        return NextResponse.json({ error: "Could not open this campus. Please try again." }, { status: 500 });
    }
}

export async function DELETE() {
    const { user, isPlatformAdmin } = await getCurrentProfile();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isPlatformAdmin) return NextResponse.json({ error: "Platform Admin access required." }, { status: 403 });

    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ success: true });
}
