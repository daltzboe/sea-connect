import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST() {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Please sign in again before deleting your account." }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();
    // The authenticated user ID comes only from the verified server session.
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(user.id, false);
    if (authError) {
        console.error("Self-service account deletion failed:", authError.message);
        return NextResponse.json({ error: "We could not delete your account. Please try again." }, { status: 500 });
    }

    const { error: profileError } = await adminSupabase.from("profiles").delete().eq("id", user.id);
    if (profileError) {
        console.error("Deleted account profile cleanup failed:", profileError.message);
        return NextResponse.json({ error: "Your login was deleted, but profile cleanup needs administrator attention." }, { status: 500 });
    }

    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.json({ success: true });
}
