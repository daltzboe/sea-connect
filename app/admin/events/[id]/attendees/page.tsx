import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PageProps = { params: Promise<{ id: string }> };

export default async function EventAttendeesPage({ params }: PageProps) {
    const { id } = await params;
    const { user, profile } = await getCurrentProfile();
    if (!user) redirect("/signin");
    if (profile?.role !== "officer") redirect("/dashboard");

    const supabase = await createSupabaseServerClient();
    const { data: event, error: eventError } = await supabase.from("events")
        .select("id,title,event_date").eq("id", id).single();
    if (eventError || !event) notFound();

    const { data: rsvps, error: rsvpError } = await supabase.from("event_rsvps")
        .select("user_id,status,created_at").eq("event_id", id).eq("status", "going")
        .order("created_at", { ascending: true });
    const userIds = (rsvps ?? []).map((rsvp) => rsvp.user_id);
    const [{ data: profiles }, { data: checkins, error: checkinError }] = await Promise.all([
        userIds.length
            ? supabase.from("profiles").select("id,full_name,country").in("id", userIds)
            : Promise.resolve({ data: [], error: null }),
        supabase.from("event_checkins").select("user_id,checked_in_at").eq("event_id", id),
    ]);
    const profileMap = new Map((profiles ?? []).map((person) => [person.id, person]));
    const checkinMap = new Map((checkins ?? []).map((checkin) => [checkin.user_id, checkin]));
    const checkedInCount = checkins?.length ?? 0;

    return (
        <main className="min-h-screen bg-gray-100 px-5 pb-12 pt-8 text-[#0C2340]">
            <div className="mx-auto max-w-md">
                <Link href="/admin/events" className="text-sm font-semibold text-gray-500">← Back to Manage Events</Link>
                <header className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F15A24]">Attendance report</p>
                    <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>
                    <p className="mt-2 text-sm text-gray-500">{new Date(event.event_date).toLocaleDateString()}</p>
                </header>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-2xl font-bold text-[#0C2340]">{rsvps?.length ?? 0}</p>
                        <p className="text-xs text-gray-500">Going / expected</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-2xl font-bold text-[#16803A]">{checkedInCount}</p>
                        <p className="text-xs text-gray-500">Checked in</p>
                    </div>
                </div>

                {(rsvpError || checkinError) && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Could not load the full attendance report. Refresh and try again.</p>}

                <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="font-bold">Going members</h2>
                    </div>
                    {!rsvps?.length ? (
                        <p className="p-5 text-sm text-gray-500">No members have RSVP'd Going yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {rsvps.map((rsvp) => {
                                const person = profileMap.get(rsvp.user_id);
                                const checkin = checkinMap.get(rsvp.user_id);
                                return (
                                    <li key={rsvp.user_id} className="flex items-center justify-between gap-3 px-5 py-4">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">{person?.full_name || "SEA Member"}</p>
                                            <p className="mt-1 text-xs text-gray-500">{person?.country || "SEAConnect member"}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${checkin ? "bg-green-100 text-green-800" : "bg-orange-50 text-orange-700"}`}>
                                            {checkin ? "Checked in" : "Not arrived"}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <Link href={`/admin/events/${id}/check-in`} className="mt-5 block rounded-xl bg-[#F15A24] px-4 py-3 text-center font-bold text-white">Open QR Scanner</Link>
            </div>
        </main>
    );
}
