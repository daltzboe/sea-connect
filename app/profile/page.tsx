import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentProfile } from "@/lib/profile";

export default async function ProfilePage() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "SEA Member";

    const country =
        profile?.country ||
        user.user_metadata?.country ||
        "Not specified";

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .map((name: string) => name.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const role = profile?.role || "member";

    const isOfficer = role.toLowerCase() === "officer";

    return (
        <main className="min-h-screen bg-[#F4F6F5] pb-24 text-[#0C2340]">

            {/* HEADER */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                {/* SEA Accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                {/* Background Glow */}
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#16803A] opacity-20 blur-3xl" />

                <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-[#F15A24] opacity-10 blur-3xl" />

                <div className="relative mx-auto max-w-md px-5 pb-10 pt-8">

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm font-semibold text-gray-300 transition hover:text-white"
                    >
                        ← Dashboard
                    </Link>

                    {/* Profile Identity */}
                    <div className="mt-8 text-center">

                        <div className="relative mx-auto w-fit">

                            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#F4C430] bg-[#0C2340] text-2xl font-bold shadow-lg">
                                {initials || "SEA"}
                            </div>

                            {/* Online Indicator */}
                            <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-[#071522] bg-[#16803A]" />

                        </div>

                        <h1 className="mt-4 text-2xl font-bold">
                            {fullName}
                        </h1>

                        <div className="mt-2 flex justify-center">

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    isOfficer
                                        ? "bg-[#F4C430]/15 text-[#F4C430]"
                                        : "bg-[#16803A]/15 text-[#5FCF83]"
                                }`}
                            >
                                {isOfficer
                                    ? "SEA Officer"
                                    : "SEA Member"}
                            </span>

                        </div>

                    </div>

                </div>

            </header>

            {/* CONTENT */}
            <div className="mx-auto max-w-md px-5 py-6">

                {/* ACCOUNT INFORMATION */}
                <section>

                    <div className="mb-4 flex items-center justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Your Account
                            </p>

                            <h2 className="mt-1 text-lg font-bold">
                                Account Information
                            </h2>
                        </div>

                        <div className="h-1 w-10 rounded-full bg-[#16803A]" />

                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                        {/* Name */}
                        <div className="flex items-center gap-4 border-b border-gray-100 p-5">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                👤
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Full Name
                                </p>

                                <p className="mt-1 truncate font-semibold">
                                    {fullName}
                                </p>

                            </div>

                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-4 border-b border-gray-100 p-5">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                                ✉️
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Email
                                </p>

                                <p className="mt-1 truncate font-semibold">
                                    {user.email}
                                </p>

                            </div>

                        </div>

                        {/* Country */}
                        <div className="flex items-center gap-4 border-b border-gray-100 p-5">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-xl">
                                🌍
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Country
                                </p>

                                <p className="mt-1 font-semibold">
                                    {country}
                                </p>

                            </div>

                        </div>

                        {/* Role */}
                        <div className="flex items-center gap-4 p-5">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">
                                ⭐
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Account Role
                                </p>

                                <p className="mt-1 font-semibold capitalize">
                                    {role}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ACCOUNT ACTIONS */}
                <section className="mt-8">

                    <div className="mb-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Settings
                        </p>

                        <h2 className="mt-1 text-lg font-bold">
                            Account
                        </h2>

                    </div>

                    <div className="space-y-3">

                        {/* Edit Profile */}
                        <Link
                            href="/profile/edit"
                            className="group flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                    ✏️
                                </div>

                                <div>

                                    <p className="font-bold">
                                        Edit Profile
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Update your name and country
                                    </p>

                                </div>

                            </div>

                            <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#16803A]">
                                →
                            </span>

                        </Link>

                        {/* Notifications */}
                        <Link
                            href="/notifications"
                            className="group flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-xl">
                                    🔔
                                </div>

                                <div>

                                    <p className="font-bold">
                                        Notifications
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage your notification settings
                                    </p>

                                </div>

                            </div>

                            <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#16803A]">
                                →
                            </span>

                        </Link>

                    </div>

                </section>

                {/* SIGN OUT */}
                <section className="mt-8">

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                        <div className="p-5">

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl">
                                    🚪
                                </div>

                                <div>

                                    <p className="font-bold">
                                        Sign out
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Sign out of your SEAConnect
                                        account on this device.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-5">
                                <LogoutButton />
                            </div>

                        </div>

                    </div>

                </section>

                {/* FOOTER */}
                <div className="mt-8 text-center">

                    <div className="flex justify-center gap-2 text-lg">
                        🇹🇿 🇰🇪 🇺🇬 🇪🇹 🇸🇴 🇷🇼
                    </div>

                    <p className="mt-3 text-xs font-semibold text-gray-400">
                        SEAConnect
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Students of East Africa • UTSA
                    </p>

                </div>

            </div>

            <BottomNav />

        </main>
    );
}