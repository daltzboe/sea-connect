
import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import EnableNotifications from "@/components/EnableNotifications";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

export default async function Dashboard() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "SEA Member";

    const firstName = fullName.trim().split(/\s+/)[0] || "Member";

    const supabase = await createSupabaseServerClient();
    const today = new Date().toISOString().split("T")[0];

    const [
        { data: upcomingEvent },
        { data: latestAnnouncement },
        { data: upcomingMeeting },
    ] = await Promise.all([
        supabase
            .from("events")
            .select("*")
            .gte("event_date", today)
            .order("event_date", { ascending: true })
            .order("event_time", { ascending: true })
            .limit(1)
            .maybeSingle(),

        supabase
            .from("announcements")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),

        supabase
            .from("meetings")
            .select("*")
            .gte("meeting_date", today)
            .order("meeting_date", { ascending: true })
            .order("meeting_time", { ascending: true })
            .limit(1)
            .maybeSingle(),
    ]);

    // Create a temporary URL for the private event image.
    let upcomingEventImageUrl: string | null = null;

    if (upcomingEvent?.image_url) {
        const { data, error } = await supabase.storage
            .from("event-images")
            .createSignedUrl(upcomingEvent.image_url, 3600);

        if (error) {
            console.error("Could not load event image:", error.message);
        }

        upcomingEventImageUrl = data?.signedUrl ?? null;
    }

    function formatTime(time: string | null) {
        if (!time) return "";

        const [hours, minutes] = time.split(":");
        const hour = Number(hours);
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
    }

    function formatDate(
        date: string,
        options: Intl.DateTimeFormatOptions
    ) {
        // Parse date-only values as local calendar dates to avoid
        // displaying the previous day in some time zones.
        const [year, month, day] = date.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day);

        return parsedDate.toLocaleDateString("en-US", options);
    }

    return (
        <main className="min-h-screen bg-[#F5F7FA] pb-28 text-[#0C2340]">

            {/* WELCOME HEADER */}
            <header className="relative overflow-hidden bg-[#071522] text-white">
                <div className="absolute inset-x-0 top-0 flex h-1">
                    <div className="flex-1 bg-[#16803A]" />
                    <div className="flex-1 bg-[#F4C430]" />
                    <div className="flex-1 bg-[#F15A24]" />
                </div>

                <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-[#16803A]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[#F15A24]/15 blur-3xl" />

                <div className="relative mx-auto max-w-lg px-5 pb-7 pt-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F4C430]">
                                SEAConnect
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Students of East Africa
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                            🌍
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm text-gray-400">
                                Welcome back,
                            </p>

                            <h1 className="mt-1 truncate text-3xl font-extrabold tracking-tight">
                                {firstName} 👋
                            </h1>

                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-400" />
                                <span className="text-xs text-gray-300">
                                    Your East African community
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F4C430] bg-[#0C2340] text-lg font-bold">
                                {firstName.charAt(0).toUpperCase()}
                            </div>

                            <NotificationBell />
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                        {profile?.role === "officer" ? (
                            <Link
                                href="/admin"
                                className="rounded-xl bg-[#F15A24] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
                            >
                                Admin Dashboard →
                            </Link>
                        ) : (
                            <Link
                                href="/profile"
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                My Profile →
                            </Link>
                        )}

                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-lg space-y-8 px-5 py-6">

                {/* NOTIFICATIONS */}
                <EnableNotifications />

                {/* COMMUNITY BANNER */}
                <section className="overflow-hidden rounded-3xl bg-[#0C2340] shadow-sm">
                    <div className="flex h-1">
                        <div className="flex-1 bg-[#16803A]" />
                        <div className="flex-1 bg-[#F4C430]" />
                        <div className="flex-1 bg-[#F15A24]" />
                    </div>

                    <div className="flex items-center justify-between gap-4 p-5">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#F4C430]">
                                One community
                            </p>

                            <h2 className="mt-2 text-lg font-bold text-white">
                                East Africa, connected.
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-gray-300">
                                Meet, connect, and grow together at UTSA.
                            </p>
                        </div>

                        <div className="shrink-0 text-4xl">🤝</div>
                    </div>
                </section>

                {/* QUICK ACCESS */}
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Explore
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold">
                                Quick Access
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/events"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#F15A24]" />
                            <div className="p-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                                    📅
                                </div>
                                <h3 className="mt-4 font-bold">Events</h3>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Find your next experience
                                </p>
                                <p className="mt-3 text-sm font-bold text-[#F15A24]">
                                    Explore →
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/announcements"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#F4C430]" />
                            <div className="p-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-2xl">
                                    📢
                                </div>
                                <h3 className="mt-4 font-bold">
                                    Announcements
                                </h3>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Stay in the loop
                                </p>
                                <p className="mt-3 text-sm font-bold text-[#0C2340]">
                                    Read updates →
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/meetings"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#0C2340]" />
                            <div className="p-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                                    🤝
                                </div>
                                <h3 className="mt-4 font-bold">Meetings</h3>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Stay connected with SEA
                                </p>
                                <p className="mt-3 text-sm font-bold text-[#0C2340]">
                                    View meetings →
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/members"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#16803A]" />
                            <div className="p-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                                    👥
                                </div>
                                <h3 className="mt-4 font-bold">Members</h3>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Meet the SEA community
                                </p>
                                <p className="mt-3 text-sm font-bold text-[#16803A]">
                                    Connect →
                                </p>
                            </div>
                        </Link>
                    </div>
                </section>

                <Link
                    href="/chat"
                    className="mt-4 flex items-center justify-between rounded-2xl bg-[#0C2340] p-4 text-white shadow-sm transition hover:bg-[#16395F]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F15A24] text-2xl">
                            💬
                        </div>

                        <div>
                            <h3 className="font-bold">SEAConnect Chat</h3>
                            <p className="text-sm text-gray-300">
                                Message members and join group chats
                            </p>
                        </div>
                    </div>

                    <span className="text-2xl">›</span>
                </Link>

                {/* UPCOMING EVENT */}
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Save the date
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold">
                                Upcoming Event
                            </h2>
                        </div>

                        <Link
                            href="/events"
                            className="text-sm font-bold text-[#F15A24] hover:underline"
                        >
                            All events →
                        </Link>
                    </div>

                    {upcomingEvent ? (
                        <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/70">
                            {upcomingEventImageUrl ? (
                                <div className="relative">
                                    <img
                                        src={upcomingEventImageUrl}
                                        alt={`Photo for ${upcomingEvent.title}`}
                                        className="h-56 w-full object-cover"
                                    />
                                    <div className="absolute bottom-3 left-3 rounded-full bg-[#0C2340]/90 px-3 py-1.5 text-xs font-bold text-white">
                                        Upcoming SEA Event
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[#0C2340] to-[#16803A] text-5xl">
                                    🌍
                                </div>
                            )}

                            <div className="bg-[#0C2340] px-5 py-5 text-white">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#F4C430]">
                                    {formatDate(upcomingEvent.event_date, {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>

                                <h3 className="mt-2 text-2xl font-extrabold">
                                    {upcomingEvent.title}
                                </h3>
                            </div>

                            <div className="space-y-4 p-5">
                                {upcomingEvent.description && (
                                    <p className="text-sm leading-6 text-gray-600">
                                        {upcomingEvent.description}
                                    </p>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg">
                                        📅
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">
                                            {formatDate(upcomingEvent.event_date, {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        {upcomingEvent.event_time && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {formatTime(upcomingEvent.event_time)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {upcomingEvent.location && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg">
                                            📍
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {upcomingEvent.location}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Event location
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <Link
                                    href="/events"
                                    className="block w-full rounded-xl bg-[#F15A24] px-4 py-3.5 text-center text-sm font-bold text-white transition hover:bg-orange-600"
                                >
                                    View Event Details →
                                </Link>
                            </div>
                        </article>
                    ) : (
                        <div className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-gray-200/70">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                                📅
                            </div>
                            <h3 className="mt-4 font-bold">
                                Nothing on the calendar yet
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Check back soon for upcoming SEA events.
                            </p>
                        </div>
                    )}
                </section>

                {/* UPCOMING MEETING */}
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Stay involved
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold">
                                Upcoming Meeting
                            </h2>
                        </div>

                        <Link
                            href="/meetings"
                            className="text-sm font-bold text-[#16803A] hover:underline"
                        >
                            All meetings →
                        </Link>
                    </div>

                    {upcomingMeeting ? (
                        <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/70">
                            <div className="flex items-center gap-4 bg-[#16803A] p-5 text-white">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                                    🤝
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-green-100">
                                        SEA Meeting
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold">
                                        {upcomingMeeting.title}
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                {upcomingMeeting.description && (
                                    <p className="text-sm leading-6 text-gray-600">
                                        {upcomingMeeting.description}
                                    </p>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg">
                                        📅
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">
                                            {formatDate(upcomingMeeting.meeting_date, {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        {upcomingMeeting.meeting_time && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {formatTime(upcomingMeeting.meeting_time)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {upcomingMeeting.location && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-lg">
                                            📍
                                        </div>
                                        <p className="text-sm font-bold">
                                            {upcomingMeeting.location}
                                        </p>
                                    </div>
                                )}

                                <Link
                                    href="/meetings"
                                    className="block w-full rounded-xl bg-[#0C2340] px-4 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                                >
                                    View Meeting Details →
                                </Link>
                            </div>
                        </article>
                    ) : (
                        <div className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-gray-200/70">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                                🤝
                            </div>
                            <h3 className="mt-4 font-bold">
                                No upcoming meetings
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Check back soon for SEA meeting updates.
                            </p>
                        </div>
                    )}
                </section>


                {/* LATEST ANNOUNCEMENT */}
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Stay informed
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold">
                                Latest Announcement
                            </h2>
                        </div>

                        <Link
                            href="/announcements"
                            className="text-sm font-bold text-[#F15A24] hover:underline"
                        >
                            All news →
                        </Link>
                    </div>

                    {latestAnnouncement ? (
                        <Link
                            href="/announcements"
                            className="block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/70 transition hover:shadow-md"
                        >
                            <div className="h-1 bg-[#F4C430]" />

                            <div className="flex gap-4 p-5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-2xl">
                                    📢
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#A87900]">
                                        Latest update
                                    </p>

                                    <h3 className="mt-1 font-bold">
                                        {latestAnnouncement.title}
                                    </h3>

                                    {latestAnnouncement.content && (
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                                            {latestAnnouncement.content}
                                        </p>
                                    )}

                                    <p className="mt-3 text-sm font-bold text-[#F15A24]">
                                        Read announcement →
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-gray-200/70">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-3xl">
                                📢
                            </div>
                            <h3 className="mt-4 font-bold">
                                No announcements yet
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                New updates from SEA will appear here.
                            </p>
                        </div>
                    )}
                </section>

                {/* FOOTER */}
                <footer className="overflow-hidden rounded-3xl bg-[#071522] text-center text-white">
                    <div className="flex h-1">
                        <div className="flex-1 bg-[#16803A]" />
                        <div className="flex-1 bg-[#F4C430]" />
                        <div className="flex-1 bg-[#F15A24]" />
                    </div>

                    <div className="px-5 py-7">
                        <p className="text-2xl">🌍</p>
                        <h2 className="mt-3 text-lg font-extrabold">
                            With SEA, Hakuna Matata.
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-gray-400">
                            Connecting Students of East Africa at UTSA.
                        </p>
                        <p className="mt-4 text-xs font-semibold tracking-widest text-[#F4C430]">
                            ONE COMMUNITY. MANY CULTURES.
                        </p>
                    </div>
                </footer>
            </div>

            <BottomNav />
        </main>
    );
}
