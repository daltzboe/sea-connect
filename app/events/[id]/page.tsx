import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import EventRsvp from "@/components/EventRsvp";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type EventPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EventDetailsPage({ params }: EventPageProps) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !event) {
        notFound();
    }

    const { data: rsvps, error: rsvpError } = await supabase
        .from("event_rsvps")
        .select("user_id, status")
        .eq("event_id", id);

    if (rsvpError) {
        console.error("Could not load event RSVPs:", rsvpError.message);
    }

    const currentRsvp = (rsvps ?? []).find((rsvp) => rsvp.user_id === user.id);
    const goingCount = (rsvps ?? []).filter((rsvp) => rsvp.status === "going").length;
    const maybeCount = (rsvps ?? []).filter((rsvp) => rsvp.status === "maybe").length;

    let imageUrl: string | null = null;
    if (event.image_url) {
        const { data } = await supabase.storage
            .from("event-images")
            .createSignedUrl(event.image_url, 3600);
        imageUrl = data?.signedUrl ?? null;
    }

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">
            <header className="relative overflow-hidden bg-[#071522] text-white">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#16803A] opacity-20 blur-3xl" />
                <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-[#F15A24] opacity-20 blur-3xl" />

                <div className="relative mx-auto max-w-md px-5 pb-8 pt-8">
                    <Link
                        href="/events"
                        className="inline-flex items-center text-sm text-gray-300 transition hover:text-white"
                    >
                        ← Back to Events
                    </Link>

                    <div className="mt-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                            SEAConnect Event
                        </p>
                        <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>
                        <div className="mt-4 text-xl">🇹🇿 🇰🇪 🇺🇬</div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">
                <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={`Photo for ${event.title}`}
                            className="max-h-72 w-full object-cover"
                        />
                    )}

                    <div className="h-1 bg-[#F15A24]" />
                    <div className="p-6">
                        {event.description && (
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-[#F15A24]">
                                    About this event
                                </p>
                                <p className="mt-3 text-sm leading-7 text-gray-600">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        <div className="mt-7 flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">
                                📅
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Date
                                </p>
                                <p className="mt-1 font-semibold">
                                    {new Date(event.event_date).toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        }
                                    )}
                                </p>
                                {event.event_time && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {new Date(`1970-01-01T${event.event_time}`).toLocaleTimeString(
                                            "en-US",
                                            { hour: "numeric", minute: "2-digit", hour12: true }
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        {event.location && (
                            <div className="mt-6 flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                                    📍
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Location
                                    </p>
                                    <p className="mt-1 font-semibold">{event.location}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </article>

                <EventRsvp
                    eventId={event.id}
                    initialStatus={
                        currentRsvp?.status === "going" || currentRsvp?.status === "maybe"
                            ? currentRsvp.status
                            : null
                    }
                    initialGoingCount={goingCount}
                    initialMaybeCount={maybeCount}
                />

                <section className="mt-6 overflow-hidden rounded-2xl bg-[#071522] text-center text-white">
                    <div className="flex h-1">
                        <div className="flex-1 bg-[#16803A]" />
                        <div className="flex-1 bg-[#F4C430]" />
                        <div className="flex-1 bg-[#F15A24]" />
                    </div>
                    <div className="p-6">
                        <p className="text-lg">🇹🇿 🇰🇪 🇺🇬 🇷🇼 🇸🇴</p>
                        <h2 className="mt-3 font-bold">Students of East Africa</h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Connecting our community at UTSA.
                        </p>
                    </div>
                </section>
            </div>

            <BottomNav />
        </main>
    );
}
