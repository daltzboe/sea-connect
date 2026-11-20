import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PageProps = { params: Promise<{ schoolId: string }> };
type MembershipRow = { user_id: string; status: string; role: string; requested_at: string };
type ProfileRow = { id: string; full_name: string | null; role: string | null };
type ChatActivityRow = {
    conversation_id: string;
    conversation_title: string | null;
    created_at: string;
    participant_count: number;
    message_count: number;
    last_message_at: string | null;
};

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#102B46] p-5">
            <p className="text-3xl font-black">{value}</p>
            <p className="mt-1 font-semibold">{label}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
    );
}

export default async function SchoolAdminDashboard({ params }: PageProps) {
    const { user, isPlatformAdmin } = await getCurrentProfile();
    if (!user) redirect("/signin");
    if (!isPlatformAdmin) redirect("/dashboard");

    const { schoolId } = await params;
    const supabase = await createSupabaseServerClient();

    const [
        { data: school, error: schoolError },
        { data: memberships, error: membershipError },
        { count: eventCount },
        { count: announcementCount },
        { count: meetingCount },
        { count: conversationCount },
        { data: events },
        { data: announcements },
        { data: meetings },
        { data: chatActivity },
    ] = await Promise.all([
        supabase.from("schools").select("id,name,short_name,city,state,country,school_type,community_enabled,is_listed").eq("id", schoolId).maybeSingle(),
        supabase.from("school_memberships").select("user_id,status,role,requested_at").eq("school_id", schoolId).order("requested_at", { ascending: false }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
        supabase.from("announcements").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
        supabase.from("meetings").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
        supabase.from("conversations").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
        supabase.from("events").select("id,title,event_date,event_time,location").eq("school_id", schoolId).order("event_date", { ascending: false }).limit(5),
        supabase.from("announcements").select("id,title,created_at").eq("school_id", schoolId).order("created_at", { ascending: false }).limit(5),
        supabase.from("meetings").select("id,title,meeting_date,meeting_time,location").eq("school_id", schoolId).order("meeting_date", { ascending: false }).limit(5),
        supabase.rpc("get_school_chat_activity", { p_school_id: schoolId }),
    ]);

    if (schoolError || !school) notFound();

    const rows = (memberships ?? []) as MembershipRow[];
    const active = rows.filter((row) => row.status === "active").length;
    const pending = rows.filter((row) => row.status === "pending").length;
    const officers = rows.filter((row) => row.status === "active" && row.role === "officer").length;
    const memberIds = [...new Set(rows.map((row) => row.user_id))];
    const { data: profiles } = memberIds.length
        ? await supabase.from("profiles").select("id,full_name,role").in("id", memberIds)
        : { data: [] as ProfileRow[] };
    const profileById = new Map(((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
    const chats = (chatActivity ?? []) as ChatActivityRow[];

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

                <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Metric label="Active members" value={active} detail={`${rows.length} total memberships`} />
                    <Metric label="Campus officers" value={officers} detail="Active officer memberships" />
                    <Metric label="Events" value={eventCount ?? 0} detail="Campus events" />
                    <Metric label="Announcements" value={announcementCount ?? 0} detail="Campus posts" />
                    <Metric label="Meetings" value={meetingCount ?? 0} detail="Scheduled / past meetings" />
                    <Metric label="Conversations" value={conversationCount ?? 0} detail="Chat groups and direct chats" />
                    <Metric label="Pending" value={pending} detail="Membership status" />
                    <Metric label="Chat messages" value={chats.reduce((sum, chat) => sum + Number(chat.message_count ?? 0), 0)} detail="Activity total · content stays private" />
                </section>

                <section className="mt-8 rounded-2xl border border-white/10 bg-[#102B46] p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div><h2 className="text-lg font-bold">Campus members</h2><p className="mt-1 text-xs text-slate-400">Membership and role overview</p></div>
                        <span className="text-xs text-slate-400">{rows.length} records</span>
                    </div>
                    <div className="mt-4 divide-y divide-white/10">
                        {rows.slice(0, 12).map((membership) => {
                            const member = profileById.get(membership.user_id);
                            return (
                                <div key={membership.user_id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{member?.full_name || "SEA Member"}</p><p className="text-xs text-slate-400">{membership.role} · {membership.status}</p></div>
                                    <span className="shrink-0 text-xs text-slate-500">{new Date(membership.requested_at).toLocaleDateString()}</span>
                                </div>
                            );
                        })}
                        {rows.length === 0 && <p className="py-4 text-sm text-slate-400">No memberships yet.</p>}
                    </div>
                </section>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <section className="rounded-2xl border border-white/10 bg-[#102B46] p-6">
                        <h2 className="text-lg font-bold">Recent events</h2>
                        <div className="mt-4 space-y-3">
                            {(events ?? []).map((event) => <div key={event.id} className="rounded-xl bg-white/5 p-3"><p className="font-semibold">{event.title}</p><p className="mt-1 text-xs text-slate-400">{event.event_date}{event.event_time ? ` · ${event.event_time}` : ""}{event.location ? ` · ${event.location}` : ""}</p></div>)}
                            {!events?.length && <p className="text-sm text-slate-400">No events posted.</p>}
                        </div>
                    </section>
                    <section className="rounded-2xl border border-white/10 bg-[#102B46] p-6">
                        <h2 className="text-lg font-bold">Recent announcements</h2>
                        <div className="mt-4 space-y-3">
                            {(announcements ?? []).map((item) => <div key={item.id} className="rounded-xl bg-white/5 p-3"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p></div>)}
                            {!announcements?.length && <p className="text-sm text-slate-400">No announcements posted.</p>}
                        </div>
                    </section>
                    <section className="rounded-2xl border border-white/10 bg-[#102B46] p-6">
                        <h2 className="text-lg font-bold">Recent meetings</h2>
                        <div className="mt-4 space-y-3">
                            {(meetings ?? []).map((item) => <div key={item.id} className="rounded-xl bg-white/5 p-3"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.meeting_date}{item.meeting_time ? ` · ${item.meeting_time}` : ""}{item.location ? ` · ${item.location}` : ""}</p></div>)}
                            {!meetings?.length && <p className="text-sm text-slate-400">No meetings posted.</p>}
                        </div>
                    </section>
                    <section className="rounded-2xl border border-white/10 bg-[#102B46] p-6">
                        <div><h2 className="text-lg font-bold">Chat activity</h2><p className="mt-1 text-xs text-slate-400">Participation metrics only. Private message text is not shown.</p></div>
                        <div className="mt-4 space-y-3">
                            {chats.slice(0, 6).map((chat) => <div key={chat.conversation_id} className="rounded-xl bg-white/5 p-3"><p className="font-semibold">{chat.conversation_title || "Direct conversation"}</p><p className="mt-1 text-xs text-slate-400">{chat.participant_count} participants · {chat.message_count} messages</p><p className="mt-1 text-xs text-slate-500">Last activity: {chat.last_message_at ? new Date(chat.last_message_at).toLocaleString() : "No messages yet"}</p></div>)}
                            {!chats.length && <p className="text-sm text-slate-400">No chat activity available.</p>}
                        </div>
                    </section>
                </div>

                {membershipError && <p className="mt-4 text-sm text-rose-300">Membership information could not be loaded. Please refresh and try again.</p>}
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/admin/schools" className="inline-flex rounded-xl bg-[#F15A24] px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Switch school</Link>
                    <span className="inline-flex rounded-xl bg-white/10 px-5 py-3 text-sm text-slate-300">{school.is_listed ? "Visible in school selector" : "Hidden from school selector"}</span>
                    <span className="inline-flex rounded-xl bg-white/10 px-5 py-3 text-sm text-slate-300">{school.school_type ?? "School type not set"}</span>
                </div>
            </div>
        </main>
    );
}
