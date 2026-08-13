import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import BottomNav from "@/components/BottomNav";

export default async function AdminPage() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    // Only officers can access the Admin Panel
    if (profile?.role !== "officer") {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#F4F6F5] pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                {/* SEA / African color accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

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
                        Admin Panel
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Manage Students of East Africa content and members.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <div className="grid grid-cols-2 gap-4">

                    {/* Users */}
                    <Link
                        href="/admin/users"
                        className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-3xl">
                            👤
                        </div>

                        <h2 className="mt-3 font-bold">
                            Users
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage accounts & roles
                        </p>
                    </Link>

                    {/* Active Members */}
                    <Link
                        href="/admin/members"
                        className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-3xl">
                            🌍
                        </div>

                        <h2 className="mt-3 font-bold">
                            Active Members
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage SEA members
                        </p>
                    </Link>

                    {/* Events */}
                    <Link
                        href="/admin/events"
                        className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-3xl">
                            📅
                        </div>

                        <h2 className="mt-3 font-bold">
                            Events
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage events
                        </p>
                    </Link>

                    {/* Announcements */}
                    <Link
                        href="/admin/announcements"
                        className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-3xl">
                            📢
                        </div>

                        <h2 className="mt-3 font-bold">
                            Announcements
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage news
                        </p>
                    </Link>

                    {/* Meetings */}
                    <Link
                        href="/admin/meetings"
                        className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-3xl">
                            🤝
                        </div>

                        <h2 className="mt-3 font-bold">
                            Meetings
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage meetings
                        </p>
                    </Link>

                </div>

                {/* Admin Notice */}
                <div className="mt-6 rounded-2xl bg-[#0C2340] p-5 text-white">

                    <p className="font-semibold">
                        Officer Access
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-300">
                        You have officer permissions. You can manage
                        users, active SEA members, events, meetings,
                        and announcements.
                    </p>

                </div>

            </div>

            <BottomNav />

        </main>
    );
}