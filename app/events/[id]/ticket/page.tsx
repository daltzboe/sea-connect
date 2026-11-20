import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EventTicketQr from "@/components/EventTicketQr";

type PageProps = { params: Promise<{ id: string }> };

export default async function EventTicketPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/signin");

    const { data: event, error: eventError } = await supabase
        .from("events").select("id,title,event_date,event_time,location").eq("id", id).single();
    if (eventError || !event) notFound();

    const { data: rsvp } = await supabase
        .from("event_rsvps").select("status").eq("event_id", id).eq("user_id", user.id).maybeSingle();
    if (rsvp?.status !== "going") redirect(`/events/${id}`);

    const { data: ticketCode, error: ticketError } = await supabase.rpc("issue_event_ticket", { p_event_id: id });
    if (ticketError || !ticketCode) {
        return (
            <main className="min-h-screen bg-gray-100 px-5 py-10 text-[#0C2340]">
                <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-bold">Your ticket is not available</h1>
                    <p className="mt-2 text-sm text-gray-600">Please confirm that your RSVP is set to Going, then try again.</p>
                    <Link href={`/events/${id}`} className="mt-5 inline-block font-semibold text-[#F15A24]">Back to event</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 px-5 pb-12 pt-8 text-[#0C2340]">
            <div className="mx-auto max-w-md">
                <Link href={`/events/${id}`} className="text-sm font-semibold text-gray-500">← Back to event</Link>
                <header className="mb-6 mt-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F15A24]">SEAConnect admission</p>
                    <h1 className="mt-2 text-3xl font-bold">Your event ticket</h1>
                    <p className="mt-2 text-sm text-gray-500">{event.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{new Date(event.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{event.event_time ? ` · ${event.event_time.slice(0, 5)}` : ""}</p>
                </header>
                <EventTicketQr ticketCode={ticketCode} />
                <p className="mt-5 text-center text-xs leading-5 text-gray-500">An officer will scan this code at the event. Each ticket can be checked in only once.</p>
            </div>
        </main>
    );
}
