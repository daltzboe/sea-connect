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
        .order("meeting_date", { ascending: true })
        .order("meeting_time", { ascending: true });

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

                {/* Top accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                {/* Background glow */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#16803A] opacity-20 blur-3xl" />

                <div className="relative mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-300 transition hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        SEAConnect
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Meetings
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-300">
                        Stay connected with upcoming SEA meetings,
                        gatherings, and community discussions.
                    </p>

                    <div className="mt-5 flex gap-2 text-xl">
                        🤝 🇹🇿 🇰🇪 🇺🇬
                    </div>

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

                {/* Empty State */}
                {!error &&
                    (!meetings || meetings.length === 0) && (
                        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                                🤝
                            </div>

                            <h2 className="mt-5 text-xl font-bold">
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
                            className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                        >

                            {/* Meeting Header */}
                            <div className="relative overflow-hidden bg-[#0C2340] px-5 py-5 text-white">

                                <div className="absolute right-0 top-0 h-full w-1 bg-[#F15A24]" />

                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#F4C430]">
                                    SEA Meeting
                                </p>

                                <h2 className="mt-2 pr-3 text-xl font-bold">
                                    {meeting.title}
                                </h2>

                            </div>

                            {/* Details */}
                            <div className="p-5">

                                {/* Description */}
                                {meeting.description && (
                                    <p className="text-sm leading-6 text-gray-600">
                                        {meeting.description}
                                    </p>
                                )}

                                {/* Date & Time */}
                                <div className="mt-5 flex gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                                        <span className="text-lg">
                                            📅
                                        </span>
                                    </div>

                                    <div className="min-w-0">

                                        <p className="font-semibold">
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
                                                {formatTime(
                                                    meeting.meeting_time
                                                )}
                                            </p>
                                        )}

                                    </div>

                                </div>

                                {/* Location */}
                                {meeting.location && (
                                    <div className="mt-4 flex gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                                            <span className="text-lg">
                                                📍
                                            </span>
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Location
                                            </p>

                                            <p className="mt-1 font-semibold">
                                                {meeting.location}
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </article>
                    ))}

                </div>

                {/* Community Footer */}
                {!error && meetings && meetings.length > 0 && (
                    <div className="mt-8 overflow-hidden rounded-2xl bg-[#071522] text-center text-white">

                        <div className="flex h-1">
                            <div className="flex-1 bg-[#16803A]" />
                            <div className="flex-1 bg-[#F4C430]" />
                            <div className="flex-1 bg-[#F15A24]" />
                        </div>

                        <div className="p-5">

                            <p className="text-sm font-semibold">
                                Stay connected with SEA 🤝
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Students of East Africa • UTSA
                            </p>

                        </div>

                    </div>
                )}

            </div>

            <BottomNav />

        </main>
    );
}