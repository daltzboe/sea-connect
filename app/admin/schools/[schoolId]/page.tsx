import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PageProps = { params: Promise<{ schoolId: string }> };
type MembershipRow = { status: string };

export default async function SchoolAdminDashboard({ params }: PageProps) {
    const { user, isPlatformAdmin } = await getCurrentProfile();
    if (!user) redirect("/signin");
    if (!isPlatformAdmin) redirect("/dashboard");

    const { schoolId } = await params;
    const supabase = await createSupabaseServerClient();
    const [{ data: school, error: schoolError }, { data: memberships, error: membershipError }] = await Promise.all([
        supabase.from("schools").select("id,name,short_name,city,state,country,school_type,community_enabled,is_listed").eq("id", schoolId).maybeSingle(),
        supabase.from("school_memberships").select("status").eq("school_id", schoolId),
    ]);

    if (schoolError || !school) notFound();
    const rows = (memberships ?? []) as MembershipRow[];
    const active = rows.filter((row) => row.status === "active").length;
    const pending = rows.filter((row) => row.status === "pending").length;
    const inactive = rows.length - active - pending;

    return (
        <main className="min-h-screen bg-[#071522] px-5 py-10 text-white">
            <div className="mx-auto max-w-5xl">
                <Link href="/admin/schools" className="text-sm text-slate-400 hover:text-white">← All schools</Link>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F4C430]">Global Admin · Campus overview</p>
                        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{school.name}</h1>
                        <p className="mt-2 text-sm text-slate-300">{school.short_name}{school.city ? ` · ${school.city}` : ""}{school.state ? `, ${school.state}` : ""}{school.country ? ` · ${school.country}` : ""}</p>
                    </div>
                    <span className={school.community_enabled ? "w-fit rounded-full bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200" : "w-fit rounded-full bg-amber-300/10 px-4 py-2 text-sm text-amber-200"}>{school.community_enabled ? "Community live" : "Campus not launched"}</span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-[#102B46] p-5"><p className="text-3xl font-black">{rows.length}</p><p className="mt-1 text-xs text-slate-400">Total memberships</p></div>
                    <div className="rounded-2xl border border-white/10 bg-[#102B46] p-5"><p className="text-3xl font-black text-emerald-200">{active}</p><p className="mt-1 text-xs text-slate-400">Active members</p></div>
                    <div className="rounded-2xl border border-white/10 bg-[#102B46] p-5"><p className="text-3xl font-black text-amber-200">{pending}</p><p className="mt-1 text-xs text-slate-400">Pending</p></div>
                    <div className="rounded-2xl border border-white/10 bg-[#102B46] p-5"><p className="text-3xl font-black">{inactive}</p><p className="mt-1 text-xs text-slate-400">Other statuses</p></div>
                </div>

                <section className="mt-8 rounded-2xl border border-white/10 bg-[#102B46] p-6">
                    <h2 className="text-lg font-bold">Campus administration</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        This is the selected school's global-admin workspace. Membership totals are scoped to this school. Campus events, chats, announcements, and officer tools will be added here after those records are fully school-scoped, so one campus never displays another campus's information.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3 text-sm">
                        <span className="rounded-xl bg-white/10 px-4 py-2">{school.is_listed ? "Visible in school selector" : "Hidden from school selector"}</span>
                        <span className="rounded-xl bg-white/10 px-4 py-2">{school.school_type ?? "School type not set"}</span>
                    </div>
                </section>

                {membershipError && <p className="mt-4 text-sm text-rose-300">Membership information could not be loaded. Please refresh and try again.</p>}
                <div className="mt-8"><Link href="/admin/schools" className="inline-flex rounded-xl bg-[#F15A24] px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Switch school</Link></div>
            </div>
        </main>
    );
}
