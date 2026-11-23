import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profile";

export async function GET() {
    const { user, profile, isPlatformAdmin, activeAdminSchool } = await getCurrentProfile();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
        isPlatformAdmin,
        schoolId: activeAdminSchool?.id ?? profile?.primary_school_id ?? null,
        chatDisplayName: isPlatformAdmin ? "SEA Admin" : profile?.full_name || "SEA Member",
    });
}
