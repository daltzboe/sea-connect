import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default async function MeetingsPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    const { data: meetings, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: true });

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                {/* SEA Accent */}
                <div className="h-1 bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-300 transition hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        Students of East Africa
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Meetings
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Stay updated with SEA meetings and gatherings.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Error */}
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">

                        <p className="font-semibold">
                            Unable to load meetings.
                        </p>

                        <p className="mt-2 text-xs">
                            {error.message}
                        </p>

                    </div>
                )}

                {/* No Meetings */}
                {!error &&
                    (!meetings || meetings.length === 0) && (
                        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16803A]/10 text-3xl">
                                🤝
                            </div>

                            <h2 className="mt-5 text-lg font-bold">
                                No upcoming meetings
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Check back soon for upcoming SEA
                                meetings and gatherings.
                            </p>

                        </div>
                    )}

                {/* Meetings */}
                <div className="space-y-5">

                    {meetings?.map((meeting) => (
                        <article
                            key={meeting.id}
                            className="overflow-hidden rounded-2xl bg-white shadow-sm"
                        >

                            {/* Meeting Header */}
                            <div className="relative overflow-hidden bg-[#0C2340] px-5 py-5 text-white">

                                {/* Orange accent */}
                                <div className="absolute right-0 top-0 h-full w-1 bg-[#F15A24]" />

                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#F4C430]">
                                    SEA Meeting
                                </p>

                                <h2 className="mt-2 text-xl font-bold">
                                    {meeting.title}
                                </h2>

                            </div>

                            {/* Details */}
                            <div className="p-5">

                                {meeting.description && (
                                    <p className="text-sm leading-6 text-gray-600">
                                        {meeting.description}
                                    </p>
                                )}

                                {/* Date & Time */}
                                <div className="mt-5 flex gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16803A]/10">
                                        <span className="text-lg">
                                            📅
                                        </span>
                                    </div>

                                    <div>

                                        <p className="font-semibold text-[#0C2340]">
                                            {new Date(
                                                meeting.meeting_date
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

                                        {meeting.meeting_time && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {new Date(`1970-01-01T${meeting.meeting_time}`).toLocaleTimeString(
                                                    "en-US",
                                                    {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    }
                                                )}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                {/* Location */}
                                {meeting.location && (
                                    <div className="mt-4 flex gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F15A24]/10">
                                            <span className="text-lg">
                                                📍
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Location
                                            </p>

                                            <p className="mt-1 font-semibold text-[#0C2340]">
                                                {meeting.location}
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