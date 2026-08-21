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

    const firstName = fullName.split(" ")[0];

    const initials = fullName
        .split(" ")
        .map((name: string) => name.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <main className="min-h-screen bg-[#F4F6F5] pb-24 text-[#0C2340]">

            {/* HEADER */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#16803A] opacity-20 blur-3xl" />

                <div className="relative mx-auto max-w-md px-5 pb-10 pt-8">

                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-gray-300 transition hover:text-white"
                    >
                        ← Dashboard
                    </Link>

                    <div className="mt-8 text-center">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#F4C430] bg-[#0C2340] text-2xl font-bold">
                            {initials}
                        </div>

                        <h1 className="mt-4 text-2xl font-bold">
                            {fullName}
                        </h1>

                        <p className="mt-1 text-sm text-gray-400">
                            SEAConnect Member
                        </p>

                    </div>

                </div>

            </header>

            {/* CONTENT */}
            <div className="mx-auto max-w-md px-5 py-6">

                {/* ACCOUNT INFORMATION */}
                <section>

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="text-lg font-bold">
                            Account Information
                        </h2>

                        <div className="h-1 w-10 rounded-full bg-[#16803A]" />

                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                        {/* Name */}
                        <div className="flex items-center gap-4 border-b border-gray-100 p-5">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                👤
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Full Name
                                </p>

                                <p className="mt-1 font-semibold">
                                    {fullName}
                                </p>

                            </div>

                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-4 border-b border-gray-100 p-5">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
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

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-xl">
                                🌍
                            </div>

                            <div>

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

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                                ⭐
                            </div>

                            <div>

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Role
                                </p>

                                <p className="mt-1 font-semibold capitalize">
                                    {profile?.role || "Member"}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ACCOUNT ACTIONS */}
                <section className="mt-8">

                    <div className="mb-4">

                        <h2 className="text-lg font-bold">
                            Account
                        </h2>

                    </div>

                    <div className="space-y-3">

                        <Link
                            href="/profile/edit"
                            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                    ✏️
                                </div>

                                <div>

                                    <p className="font-bold">
                                        Edit Profile
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Update your information
                                    </p>

                                </div>

                            </div>

                            <span className="text-xl text-gray-400">
                                →
                            </span>

                        </Link>

                        <Link
                            href="/notifications"
                            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-xl">
                                    🔔
                                </div>

                                <div>

                                    <p className="font-bold">
                                        Notifications
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage your notifications
                                    </p>

                                </div>

                            </div>

                            <span className="text-xl text-gray-400">
                                →
                            </span>

                        </Link>

                    </div>

                </section>

                {/* SIGN OUT */}
                <section className="mt-8">

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <div className="mb-4">

                            <p className="font-bold">
                                Sign out
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                You'll need to sign in again to access SEAConnect.
                            </p>

                        </div>

                        <LogoutButton />

                    </div>

                </section>

                {/* FOOTER */}
                <div className="mt-8 text-center">

                    <p className="text-xs text-gray-400">
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