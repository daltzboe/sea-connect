import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EnterSchoolAdminButton from "@/components/EnterSchoolAdminButton";

type SchoolRow = {
    id: string;
    name: string;
    short_name: string;
    city: string | null;
    state: string | null;
    country: string;
    community_enabled: boolean;
    is_listed: boolean;
};

type MembershipRow = { school_id: string; status: string };

export default async function GlobalSchoolDirectoryPage() {
    const { user, isPlatformAdmin } = await getCurrentProfile();
    if (!user) redirect("/signin");
    if (!isPlatformAdmin) redirect("/dashboard");

    const supabase = await createSupabaseServerClient();
    const [schoolResult, membershipResult] = await Promise.all([
        supabase.from("schools").select("id,name,short_name,city,state,country,community_enabled,is_listed").eq("is_listed", true).eq("school_type", "university").order("name"),
        supabase.from("school_memberships").select("school_id,status"),
    ]);

    const schools = (schoolResult.data ?? []) as SchoolRow[];
    const memberships = (membershipResult.data ?? []) as MembershipRow[];
    const activeCounts = new Map<string, number>();
    for (const membership of memberships) {
        if (membership.status === "active") {
            activeCounts.set(membership.school_id, (activeCounts.get(membership.school_id) ?? 0) + 1);
        }
    }

    const launchedCount = schools.filter((school) => school.community_enabled).length;
    const activeMemberCount = memberships.filter((membership) => membership.status === "active").length;

    return (
        <main className="min-h-screen bg-[#071522] px-5 py-10 text-white">
            <div className="mx-auto max-w-5xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F4C430]">SEAConnect · Global Platform Admin</p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">Global School Directory</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Your account is platform-wide and is not assigned to a campus. Choose any school to open its administration overview.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#102B46] p-4"><p className="text-2xl font-black">{schools.length}</p><p className="mt-1 text-xs text-slate-400">Schools listed</p></div>
                    <div className="rounded-2xl border border-white/10 bg-[#102B46] p-4"><p className="text-2xl font-black">{launchedCount}</p><p className="mt-1 text-xs text-slate-400">Communities launched</p></div>
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-[#102B46] p-4 md:col-span-1"><p className="text-2xl font-black">{activeMemberCount}</p><p className="mt-1 text-xs text-slate-400">Active memberships</p></div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">All schools</h2>
                    <span className="text-xs text-slate-400">Select a campus to open it</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {schools.map((school) => (
                        <div key={school.id} className="rounded-2xl border border-white/10 bg-[#102B46] p-5 transition hover:border-[#F4C430]/40">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold">{school.name}</p>
                                    <p className="mt-1 text-xs text-slate-400">{school.short_name}{school.city ? ` · ${school.city}` : ""}{school.state ? `, ${school.state}` : ""}{school.country !== "United States" ? ` · ${school.country}` : ""}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs">{activeCounts.get(school.id) ?? 0} members</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className={school.community_enabled ? "rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-200" : "rounded-full bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200"}>{school.community_enabled ? "Community live" : "Not launched"}</span>
                                <Link href={`/admin/schools/${school.id}`} className="text-sm font-semibold text-slate-200 hover:text-white">View overview</Link>
                            </div>
                            <div className="mt-4 border-t border-white/10 pt-4">
                                <EnterSchoolAdminButton schoolId={school.id} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
