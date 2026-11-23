import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function CampusComingSoonPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    const { data: profile } = await supabase
        .from("profiles")
        .select("primary_school_id")
        .eq("id", user.id)
        .maybeSingle();

    const { data: school } = profile?.primary_school_id
        ? await supabase
            .from("schools")
            .select("name,short_name,city,state")
            .eq("id", profile.primary_school_id)
            .maybeSingle()
        : { data: null };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#071522] px-5 py-10 text-white">
            <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#102B46] p-8 text-center shadow-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16803A] text-2xl">
                    🌍
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#F4C430]">
                    SEAConnect
                </p>
                <h1 className="mt-2 text-2xl font-bold">
                    You're in{school?.short_name ? ` · ${school.short_name}` : ""}
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                    Your school membership is active. No officer approval is required.
                    We're preparing the SEAConnect community for {school?.name ?? "your campus"}.
                    Once the campus is launched, your school events, members, announcements,
                    and chats will be available here.
                </p>
                {school?.city && school?.state && (
                    <p className="mt-3 text-xs text-slate-400">
                        {school.city}, {school.state}
                    </p>
                )}
                <Link
                    href="/"
                    className="mt-7 inline-flex rounded-xl bg-[#F15A24] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#df4d1b]"
                >
                    Return to SEAConnect
                </Link>
            </section>
        </main>
    );
}
