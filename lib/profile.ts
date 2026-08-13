import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getCurrentProfile() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            profile: null,
        };
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, position, country, created_at")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Could not load profile:", error.message);

        return {
            user,
            profile: null,
        };
    }

    return {
        user,
        profile,
    };
}