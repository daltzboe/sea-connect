"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useMemo } from "react";
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
    const firstName = fullName.trim().split(/\\s+/)[0] || "Member";
    const initials = fullName
        .trim()
        .split(/\\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

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
        return `${hour % 12 || 12}:${minutes} ${period}`;
    }

    function formatDate(
        date: string,
        options: Intl.DateTimeFormatOptions
    ) {
        const [year, month, day] = date.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString(
            "en-US",
            options
        );
    }

    return (
        <main className="min-h-screen bg-[#F4F6FA] pb-28 text-[#10243A]">
            <div className="mx-auto min-h-screen max-w-2xl bg-[#F4F6FA] shadow-[0_0_60px_rgba(12,35,64,0.05)]">
                <header className="relative overflow-hidden rounded-b-[2rem] bg-[#0C2340] px-5 pb-8 pt-6 text-white sm:px-7">
                    <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#F15A24]/20 blur-3xl" />
                    <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
                    <div className="absolute inset-x-0 top-0 flex h-1">
                        <span className="flex-1 bg-[#16803A]" />
                        <span className="flex-1 bg-[#F4C430]" />
                        <span className="flex-1 bg-[#F15A24]" />
                    </div>

                    <div className="relative flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15">
                                🌍
                            </span>
                            <span>
                                <span className="block text-sm font-black tracking-[0.16em] text-white">
                                    SEACONNECT
                                </span>
                                <span className="mt-0.5 block text-[11px] text-blue-100/70">
                                    Students of East Africa · UTSA
                                </span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#F4C430] bg-[#173B5D] text-sm font-extrabold text-white">
                                {initials || "S"}
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-9">
                        <p className="text-sm font-medium text-blue-100/75">
                            YOUR COMMUNITY, YOUR HOME
                        </p>
                        <h1 className="mt-2 max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                            Hey, {firstName} <span aria-hidden="true">👋</span>
                        </h1>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-blue-100/75">
                            Find your people, discover what is happening, and stay connected with East Africa at UTSA.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/events"
                                className="inline-flex items-center justify-center rounded-xl bg-[#F15A24] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-[#ff6a32]"
                            >
                                Explore events <span className="ml-2">→</span>
                            </Link>
                            {profile?.role === "officer" ? (
                                <Link
                                    href="/admin"
                                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    Officer tools
                                </Link>
                            ) : (
                                <Link
                                    href="/profile"
                                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    View profile
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="relative mt-7 flex items-center justify-between border-t border-white/10 pt-4">
                        <div className="flex items-center gap-2 text-xs text-blue-100/70">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
                            A community that feels like home
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                <div className="space-y-8 px-5 py-7 sm:px-7">
                    <EnableNotifications />

                    <section>
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#F15A24]">
                                    Find your corner
                                </p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#0C2340]">
                                    Explore SEAConnect
                                </h2>
                            </div>
                            <span className="pb-1 text-xs font-medium text-slate-400">
                                Your campus community
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                {
                                    href: "/events",
                                    label: "Events",
                                    detail: "What's happening",
                                    icon: "🎉",
                                    tone: "bg-orange-50",
                                    accent: "text-[#F15A24]",
                                },
                                {
                                    href: "/announcements",
                                    label: "Updates",
                                    detail: "News from SEA",
                                    icon: "📣",
                                    tone: "bg-amber-50",
                                    accent: "text-amber-700",
                                },
                                {
                                    href: "/meetings",
                                    label: "Meetings",
                                    detail: "Get involved",
                                    icon: "🤝",
                                    tone: "bg-blue-50",
                                    accent: "text-[#0C2340]",
                                },
                                {
                                    href: "/members",
                                    label: "Members",
                                    detail: "Meet your people",
                                    icon: "🌍",
                                    tone: "bg-emerald-50",
                                    accent: "text-emerald-700",
                                },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,35,60,0.035)] transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                                >
                                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone} text-2xl transition group-hover:scale-105`}>
                                        {item.icon}
                                    </span>
                                    <span className="mt-4 block text-sm font-extrabold text-[#0C2340]">
                                        {item.label}
                                    </span>
                                    <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                                        {item.detail}
                                    </span>
                                    <span className={`mt-3 block text-xs font-bold ${item.accent}`}>
                                        Explore <span aria-hidden="true">↗</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <Link
                        href="/chat"
                        className="group flex items-center gap-4 overflow-hidden rounded-2xl bg-[#102E4D] p-4 text-white shadow-lg shadow-[#0C2340]/10 transition hover:bg-[#173B5D]"
                    >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F15A24] text-2xl">
                            💬
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-extrabold">
                                The conversation continues
                            </span>
                            <span className="mt-1 block text-xs text-blue-100/70">
                                Catch up and connect with SEA members.
                            </span>
                        </span>
                        <span className="text-xl text-orange-300 transition group-hover:translate-x-1">
                            →
                        </span>
                    </Link>

                    <section>
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#F15A24]">
                                    Save your spot
                                </p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#0C2340]">
                                    Coming up at SEA
                                </h2>
                            </div>
                            <Link href="/events" className="text-xs font-bold text-[#F15A24] hover:underline">
                                All events →
                            </Link>
                        </div>

                        {upcomingEvent ? (
                            <article className="overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,60,0.07)]">
                                <div className="relative h-52 bg-gradient-to-br from-[#0C2340] via-[#16466A] to-[#16803A] sm:h-64">
                                    {upcomingEventImageUrl ? (
                                        <img
                                            src={upcomingEventImageUrl}
                                            alt={`Photo for ${upcomingEvent.title}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-6xl">
                                            🌍
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#071522]/80 via-transparent to-black/10" />
                                    <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#0C2340]/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                                        Featured SEA event
                                    </span>
                                    <div className="absolute bottom-4 left-5 right-5 text-white">
                                        <p className="text-xs font-semibold text-orange-200">
                                            {formatDate(upcomingEvent.event_date, {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <h3 className="mt-1 text-2xl font-black leading-tight">
                                            {upcomingEvent.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    {upcomingEvent.description && (
                                        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                                            {upcomingEvent.description}
                                        </p>
                                    )}
                                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-slate-600">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="text-base">🕒</span>
                                            {formatTime(upcomingEvent.event_time) || "Time to be announced"}
                                        </span>
                                        {upcomingEvent.location && (
                                            <span className="inline-flex items-center gap-2">
                                                <span className="text-base">📍</span>
                                                {upcomingEvent.location}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href="/events"
                                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#F15A24] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#df4d1b]"
                                    >
                                        View event details <span className="ml-2">→</span>
                                    </Link>
                                </div>
                            </article>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-9 text-center">
                                <span className="text-3xl">📅</span>
                                <h3 className="mt-3 font-bold text-[#0C2340]">Nothing scheduled just yet</h3>
                                <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-slate-500">
                                    Keep an eye here for the next chance to meet, celebrate, and connect.
                                </p>
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                                    Stay connected
                                </p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#0C2340]">
                                    Next SEA meeting
                                </h2>
                            </div>
                            <Link href="/meetings" className="text-xs font-bold text-emerald-700 hover:underline">
                                All meetings →
                            </Link>
                        </div>

                        {upcomingMeeting ? (
                            <article className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,35,60,0.04)]">
                                <div className="flex w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 px-2 py-3 text-center">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                                        {formatDate(upcomingMeeting.meeting_date, { month: "short" })}
                                    </span>
                                    <span className="mt-0.5 text-2xl font-black text-[#0C2340]">
                                        {formatDate(upcomingMeeting.meeting_date, { day: "numeric" })}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 py-1">
                                    <h3 className="font-extrabold text-[#0C2340]">
                                        {upcomingMeeting.title}
                                    </h3>
                                    {upcomingMeeting.description && (
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                            {upcomingMeeting.description}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs font-semibold text-slate-600">
                                        {formatTime(upcomingMeeting.meeting_time) || "Time to be announced"}
                                        {upcomingMeeting.location ? ` · ${upcomingMeeting.location}` : ""}
                                    </p>
                                    <Link href="/meetings" className="mt-3 inline-block text-xs font-bold text-emerald-700 hover:underline">
                                        Meeting details →
                                    </Link>
                                </div>
                            </article>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                                <p className="text-2xl">🤝</p>
                                <p className="mt-2 text-sm font-bold text-[#0C2340]">No upcoming meetings</p>
                                <p className="mt-1 text-xs text-slate-500">New meeting details will show up here.</p>
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700">
                                    From the community
                                </p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#0C2340]">
                                    The latest
                                </h2>
                            </div>
                            <Link href="/announcements" className="text-xs font-bold text-[#F15A24] hover:underline">
                                All updates →
                            </Link>
                        </div>

                        {latestAnnouncement ? (
                            <Link
                                href="/announcements"
                                className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(15,35,60,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl">
                                        📣
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                                            SEA announcement
                                        </span>
                                        <h3 className="mt-1 font-extrabold text-[#0C2340]">
                                            {latestAnnouncement.title}
                                        </h3>
                                    </div>
                                    <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#F15A24]">
                                        →
                                    </span>
                                </div>
                                {latestAnnouncement.content && (
                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                        {latestAnnouncement.content}
                                    </p>
                                )}
                            </Link>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                                <p className="text-2xl">📣</p>
                                <p className="mt-2 text-sm font-bold text-[#0C2340]">No announcements yet</p>
                                <p className="mt-1 text-xs text-slate-500">Community updates will appear here.</p>
                            </div>
                        )}
                    </section>

                    <footer className="overflow-hidden rounded-2xl bg-[#0C2340] text-center text-white">
                        <div className="flex h-1">
                            <span className="flex-1 bg-[#16803A]" />
                            <span className="flex-1 bg-[#F4C430]" />
                            <span className="flex-1 bg-[#F15A24]" />
                        </div>
                        <div className="px-5 py-7">
                            <p className="text-2xl">🌍</p>
                            <p className="mt-2 text-base font-extrabold">One community. Many cultures.</p>
                            <p className="mt-1 text-xs text-blue-100/65">
                                Connecting Students of East Africa at UTSA.
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
            <BottomNav />
        </main>
    );
}
