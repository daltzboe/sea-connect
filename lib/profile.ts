import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ADMIN_SCHOOL_COOKIE = "sea_admin_school_id";

export async function getCurrentProfile() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            profile: null,
            isPlatformAdmin: false,
            activeAdminSchool: null,
        };
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, position, country, created_at, primary_school_id")
        .eq("id", user.id)
        .single();

    if (error || !profile) {
        console.error("Could not load profile:", error?.message);
        return {
            user,
            profile: null,
            isPlatformAdmin: false,
            activeAdminSchool: null,
        };
    }

    const { data: isPlatformAdmin } = await supabase.rpc("is_platform_admin");
    const platformAdmin = Boolean(isPlatformAdmin);

    // A campus context is honored only for a verified global platform admin.
    // The cookie is HTTP-only and is set by /api/admin/act-as after checking the directory.
    let activeAdminSchool: { id: string; name: string; short_name: string } | null = null;
    let effectiveProfile = profile;

    if (platformAdmin) {
        const cookieStore = await cookies();
        const requestedSchoolId = cookieStore.get(ADMIN_SCHOOL_COOKIE)?.value;

        if (requestedSchoolId) {
            const { data: school } = await supabase
                .from("schools")
                .select("id,name,short_name")
                .eq("id", requestedSchoolId)
                .eq("is_listed", true)
                .maybeSingle();

            if (school) {
                activeAdminSchool = school;
                effectiveProfile = {
                    ...profile,
                    role: "officer",
                    primary_school_id: school.id,
                };
            }
        }
    }

    return {
        user,
        profile: effectiveProfile,
        isPlatformAdmin: platformAdmin,
        activeAdminSchool,
    };
}
