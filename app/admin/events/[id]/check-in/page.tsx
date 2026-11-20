import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EventCheckInScanner from "@/components/EventCheckInScanner";

type PageProps = { params: Promise<{ id: string }> };

export default async function EventCheckInPage({ params }: PageProps) {
    const { id } = await params;
    const { user, profile } = await getCurrentProfile();
    if (!user) redirect("/signin");
    if (profile?.role !== "officer") redirect("/dashboard");

    const supabase = await createSupabaseServerClient();
    const { data: event, error } = await supabase.from("events")
        .select("id,title,event_date").eq("id", id).single();
    if (error || !event) notFound();

    return (
        <main className="min-h-screen bg-gray-100 px-5 pb-12 pt-8 text-[#0C2340]">
            <div className="mx-auto max-w-md">
                <Link href="/admin/events" className="text-sm font-semibold text-gray-500">← Back to Manage Events</Link>
                <header className="mb-6 mt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F15A24]">Officer tools</p>
                    <h1 className="mt-2 text-3xl font-bold">Event Check-In</h1>
                    <p className="mt-2 text-sm text-gray-500">{event.title} · {new Date(event.event_date).toLocaleDateString()}</p>
                </header>
                <EventCheckInScanner eventId={event.id} />
                <Link href={`/admin/events/${id}/attendees`} className="mt-5 block text-center text-sm font-semibold text-[#F15A24]">View attendee list and attendance</Link>
            </div>
        </main>
    );
}
