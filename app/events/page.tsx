import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default async function EventsPage() {
    const { user } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    const supabase = await createSupabaseServerClient();

    const { data: events, error } = await supabase
        .from("events")
        .select(
            "id, title, description, event_date, event_time, location"
        )
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });

    function formatTime(time: string) {
        if (!time) return "";

        const [hours, minutes] = time.split(":");
        const hour = Number(hours);

        const period = hour >= 12 ? "PM" : "AM";

        const displayHour =
            hour === 0
                ? 12
                : hour > 12
                    ? hour - 12
                    : hour;

        return `${displayHour}:${minutes} ${period}`;
    }

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#16803A] opacity-20 blur-3xl" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/dashboard"
                        prefetch={true}
                        className="inline-flex items-center text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        SEAConnect
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Events
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Discover upcoming events across the
                        Students of East Africa community.
                    </p>

                    <div className="mt-5 flex gap-2 text-xl">
                        🇹🇿 🇰🇪 🇺🇬
                    </div>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Error */}
                {error && (
                    <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
                        <p className="font-semibold">
                            Unable to load events.
                        </p>

                        <p className="mt-2 text-xs">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* No Events */}
                {!error && (!events || events.length === 0) && (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

                        <div className="text-4xl">
                            📅
                        </div>

                        <h2 className="mt-4 text-lg font-bold">
                            No upcoming events
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Check back soon for upcoming SEA events.
                        </p>

                    </div>
                )}

                {/* Events */}
                <div className="space-y-5">

                    {events?.map((event) => (
                        <article
                            key={event.id}
                            className="overflow-hidden rounded-2xl bg-white shadow-sm"
                        >

                            {/* Event Header */}
                            <div className="bg-[#F15A24] px-5 py-4 text-white">

                                <p className="text-xs font-semibold uppercase tracking-wide">
                                    {new Date(
                                        event.event_date
                                    ).toLocaleDateString(
                                        "en-US",
                                        {
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )}
                                </p>

                                <h2 className="mt-1 text-xl font-bold">
                                    {event.title}
                                </h2>

                            </div>

                            {/* Event Details */}
                            <div className="p-5">

                                {event.description && (
                                    <p className="text-sm leading-6 text-gray-600">
                                        {event.description}
                                    </p>
                                )}

                                <div className="mt-5 flex gap-3">

                                    <span className="text-xl">
                                        📅
                                    </span>

                                    <div>

                                        <p className="font-medium">
                                            {new Date(
                                                event.event_date
                                            ).toLocaleDateString(
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
                                            <p className="text-sm text-gray-500">
                                                {formatTime(
                                                    event.event_time
                                                )}
                                            </p>
                                        )}

                                    </div>

                                </div>

                                {event.location && (
                                    <div className="mt-4 flex gap-3">

                                        <span className="text-xl">
                                            📍
                                        </span>

                                        <div>
                                            <p className="font-medium">
                                                {event.location}
                                            </p>
                                        </div>

                                    </div>
                                )}

                            </div>

                        </article>
                    ))}

                </div>

            </div>

            <BottomNav />

        </main>
    );
}