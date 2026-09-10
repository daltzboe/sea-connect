import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DeleteEventButton from "@/components/DeleteEventButton";

export default async function AdminEventsPage() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    if (profile?.role !== "officer") {
        redirect("/dashboard");
    }

    const supabase = await createSupabaseServerClient();

    const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

    return (
        <main className="min-h-screen bg-gray-100 text-[#0C2340]">

            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">
                <div className="mx-auto max-w-md">

                    <Link
                        href="/admin"
                        prefetch={true}
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Admin
                    </Link>

                    <h1 className="mt-5 text-3xl font-bold">
                        Manage Events
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Create and manage SEA events.
                    </p>

                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <Link
                    href="/admin/events/create"
                    prefetch={true}
                    className="block rounded-2xl bg-[#F15A24] px-5 py-4 text-center font-bold text-white shadow-sm"
                >
                    + Create Event
                </Link>

                <div className="mt-6 space-y-4">

                    {error && (
                        <div className="rounded-2xl bg-red-50 p-5 text-red-600">
                            {error.message}
                        </div>
                    )}

                    {events?.map((event) => (
                        <div
                            key={event.id}
                            className="rounded-2xl bg-white p-5 shadow-sm"
                        >
                            <h2 className="font-bold">
                                {event.title}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                {event.event_date}
                            </p>

                            <p className="text-sm text-gray-500">
                                {event.event_time}
                            </p>

                            <p className="text-sm text-gray-500">
                                📍 {event.location}
                            </p>
                            <div className="mt-4 flex gap-3">

                                <Link
                                    href={`/admin/events/edit/${event.id}`}
                                    prefetch={true}
                                    className="flex-1 rounded-xl bg-[#0C2340] px-4 py-3 text-center text-sm font-semibold text-white"
                                >
                                    Edit
                                </Link>

                                <DeleteEventButton eventId={event.id} />

                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </main>
    );
}