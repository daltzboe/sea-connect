import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentProfile } from "@/lib/profile";
import NotificationBell from "@/components/NotificationBell";

export default async function Dashboard() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "SEA Member";

    const firstName = fullName.split(" ")[0];

    const supabase = await createSupabaseServerClient();

    // Get the next upcoming event
    const { data: upcomingEvent } = await supabase
        .from("events")
        .select("*")
        .gte(
            "event_date",
            new Date().toISOString().split("T")[0]
        )
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true })
        .limit(1)
        .maybeSingle();

    // Get latest announcement
    const { data: latestAnnouncement } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    // Get upcoming meeting
    const { data: upcomingMeeting } = await supabase
        .from("meetings")
        .select("*")
        .gte(
            "meeting_date",
            new Date().toISOString().split("T")[0]
        )
        .order("meeting_date", { ascending: true })
        .limit(1)
        .maybeSingle();
    function formatTime(time: string) {
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
        <main className="min-h-screen bg-[#F4F6F5] pb-24 text-[#0C2340]">

            {/* HERO HEADER */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                {/* Decorative colors */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#16803A] opacity-20 blur-3xl" />

                <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-[#F15A24] opacity-20 blur-3xl" />

                <div className="relative mx-auto max-w-md px-5 pb-7 pt-9">

                    {/* Brand */}
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                                SEAConnect
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Students of East Africa
                            </p>
                        </div>

                        <div className="flex gap-1 text-lg">
                            🇪🇹 🇰🇪 🇺🇬
                        </div>

                    </div>

                    {/* Welcome */}
                    <div className="mt-8 flex items-end justify-between">

                        <div>

                            <p className="text-sm text-gray-400">
                                Welcome back
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                {firstName} 👋
                            </h1>

                            <div className="mt-3 flex items-center gap-2">

                                <span className="h-2 w-2 rounded-full bg-[#16803A]" />

                                <p className="text-xs text-gray-300">
                                    East African Community
                                </p>

                            </div>

                        </div>

                        <div className="flex flex-col items-end gap-2">

                            <div className="flex items-center gap-2">

                                <NotificationBell />

                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F4C430] bg-[#0C2340] text-lg font-bold">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>

                            </div>

                            {profile?.role === "officer" && (
                                <Link
                                    href="/admin"
                                    className="rounded-xl bg-[#F15A24] px-3 py-2 text-xs font-semibold text-white"
                                >
                                    Admin
                                </Link>
                            )}

                        </div>

                    </div>

                    {/* Logout */}
                    <div className="mt-4 flex justify-end">
                        <LogoutButton />
                    </div>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* EAST AFRICA STRIP */}
                <div className="mb-7 overflow-hidden rounded-2xl bg-[#0C2340] shadow-sm">

                    <div className="flex h-1">
                        <div className="flex-1 bg-[#16803A]" />
                        <div className="flex-1 bg-[#F4C430]" />
                        <div className="flex-1 bg-[#F15A24]" />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#F4C430]">
                                Our Community
                            </p>

                            <p className="mt-1 text-sm text-white">
                                Connecting East African students at UTSA
                            </p>
                        </div>

                        <div className="ml-3 shrink-0 text-xl">
                            🇹🇿 🇰🇪 🇺🇬
                        </div>

                    </div>

                </div>

                {/* QUICK ACCESS */}
                <section>

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="text-lg font-bold">
                            Quick Access
                        </h2>

                        <div className="h-1 w-10 rounded-full bg-[#F15A24]" />

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        {/* Events */}
                        <Link
                            href="/events"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#F15A24]" />

                            <div className="p-5">

                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                                    📅
                                </div>

                                <p className="font-bold">
                                    Events
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    See what's happening
                                </p>

                            </div>
                        </Link>

                        {/* Announcements */}
                        <Link
                            href="/announcements"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#F4C430]" />

                            <div className="p-5">

                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
                                    📢
                                </div>

                                <p className="font-bold">
                                    Announcements
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Latest SEA news
                                </p>

                            </div>
                        </Link>

                        {/* Meetings */}
                        <Link
                            href="/meetings"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#0C2340]" />

                            <div className="p-5">

                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                                    🤝
                                </div>

                                <p className="font-bold">
                                    Meetings
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Upcoming meetings
                                </p>

                            </div>
                        </Link>

                        {/* Members */}
                        <Link
                            href="/members"
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="h-1 bg-[#16803A]" />

                            <div className="p-5">

                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
                                    👥
                                </div>

                                <p className="font-bold">
                                    Members
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Meet the community
                                </p>

                            </div>
                        </Link>

                    </div>

                </section>

                {/* UPCOMING EVENT */}
                <section className="mt-9">

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="text-lg font-bold">
                            Upcoming Event
                        </h2>

                        <Link
                            href="/events"
                            className="text-sm font-bold text-[#F15A24]"
                        >
                            View all →
                        </Link>

                    </div>

                    {upcomingEvent ? (
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                            <div className="relative bg-[#0C2340] px-5 py-5 text-white">

                                <div className="absolute right-5 top-4 text-xl">
                                    🇸🇴
                                </div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#F4C430]">
                                    {new Date(
                                        upcomingEvent.event_date
                                    ).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>

                                <h3 className="mt-1 pr-10 text-xl font-bold">
                                    {upcomingEvent.title}
                                </h3>

                            </div>

                            <div className="p-5">

                                {upcomingEvent.description && (
                                    <p className="text-sm leading-6 text-gray-600">
                                        {upcomingEvent.description}
                                    </p>
                                )}

                                <div className="mt-5 flex gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                                        📅
                                    </div>

                                    <div>

                                        <p className="font-semibold">
                                            {new Date(
                                                upcomingEvent.event_date
                                            ).toLocaleDateString("en-US", {
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
                                    <div className="mt-4 flex gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                                            📍
                                        </div>

                                        <div>
                                            <p className="font-semibold">
                                                {upcomingEvent.location}
                                            </p>
                                        </div>

                                    </div>
                                )}

                                <Link
                                    href="/events"
                                    className="mt-5 block w-full rounded-xl bg-[#F15A24] px-4 py-3 text-center font-bold text-white transition hover:opacity-90"
                                >
                                    View Event
                                </Link>

                            </div>

                        </div>
                    ) : (
                        <div className="rounded-2xl bg-white p-7 text-center shadow-sm">

                            <div className="text-3xl">
                                📅
                            </div>

                            <h3 className="mt-3 font-bold">
                                No upcoming events
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Check back soon for upcoming SEA events.
                            </p>

                        </div>
                    )}

                </section>

                {/* UPCOMING MEETING */}
                <section className="mt-9">

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="text-lg font-bold">
                            Upcoming Meeting
                        </h2>

                        <Link
                            href="/meetings"
                            className="text-sm font-bold text-[#16803A]"
                        >
                            View all →
                        </Link>

                    </div>

                    {upcomingMeeting ? (
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                            <div className="relative bg-[#16803A] px-5 py-5 text-white">

                                <div className="absolute right-5 top-4 text-xl">
                                    🇰🇪
                                </div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#F4C430]">
                                    SEA Meeting
                                </p>

                                <h3 className="mt-1 pr-10 text-xl font-bold">
                                    {upcomingMeeting.title}
                                </h3>

                            </div>

                            <div className="p-5">

                                {upcomingMeeting.description && (
                                    <p className="text-sm leading-6 text-gray-600">
                                        {upcomingMeeting.description}
                                    </p>
                                )}

                                <div className="mt-5 flex gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                                        📅
                                    </div>

                                    <div>

                                        <p className="font-semibold">
                                            {new Date(
                                                upcomingMeeting.meeting_date
                                            ).toLocaleDateString("en-US", {
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
                                    <div className="mt-4 flex gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50">
                                            📍
                                        </div>

                                        <p className="font-semibold">
                                            {upcomingMeeting.location}
                                        </p>

                                    </div>
                                )}

                                <Link
                                    href="/meetings"
                                    className="mt-5 block w-full rounded-xl bg-[#0C2340] px-4 py-3 text-center font-bold text-white transition hover:opacity-90"
                                >
                                    View Meeting
                                </Link>

                            </div>

                        </div>
                    ) : (
                        <div className="rounded-2xl bg-white p-7 text-center shadow-sm">

                            <div className="text-3xl">
                                🤝
                            </div>

                            <h3 className="mt-3 font-bold">
                                No upcoming meetings
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Check back soon for upcoming SEA meetings.
                            </p>

                        </div>
                    )}

                </section>

                {/* LATEST ANNOUNCEMENT */}
                <section className="mt-9">

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="text-lg font-bold">
                            Latest Announcement
                        </h2>

                        <Link
                            href="/announcements"
                            className="text-sm font-bold text-[#F4C430]"
                        >
                            View all →
                        </Link>

                    </div>

                    {latestAnnouncement ? (
                        <Link
                            href="/announcements"
                            className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                        >

                            <div className="h-1 bg-[#F4C430]" />

                            <div className="p-5">

                                <div className="flex gap-4">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-xl">
                                        📢
                                    </div>

                                    <div className="min-w-0">

                                        <h3 className="font-bold">
                                            {latestAnnouncement.title}
                                        </h3>

                                        {latestAnnouncement.content && (
                                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                                                {latestAnnouncement.content}
                                            </p>
                                        )}

                                        <p className="mt-3 text-xs font-medium text-gray-400">
                                            Posted recently
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </Link>
                    ) : (
                        <div className="rounded-2xl bg-white p-7 text-center shadow-sm">

                            <div className="text-3xl">
                                📢
                            </div>

                            <h3 className="mt-3 font-bold">
                                No announcements yet
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Check back soon for SEA announcements.
                            </p>

                        </div>
                    )}

                </section>

                {/* COMMUNITY FOOTER */}
                <section className="mt-9 overflow-hidden rounded-2xl bg-[#071522] text-white shadow-sm">

                    <div className="flex h-1">
                        <div className="flex-1 bg-[#16803A]" />
                        <div className="flex-1 bg-[#F4C430]" />
                        <div className="flex-1 bg-[#F15A24]" />
                    </div>

                    <div className="p-6 text-center">


                        <h3 className="mt-4 text-lg font-bold">
                            With SEA, Hakuna Matata.
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-400">
                            Connecting Students of East Africa
                            at UTSA.
                        </p>

                    </div>

                </section>

            </div>

            <BottomNav />

        </main>
    );
}