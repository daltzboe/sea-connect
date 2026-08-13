import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import BottomNav from "@/components/BottomNav";

export default async function ProfilePage() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "SEA Member";

    const email = user.email || "";

    const country =
        profile?.country || "Country not provided";

    const position =
        profile?.position || "SEA Member";

    const role =
        profile?.role || "member";

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .map((name: string) => name.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <main className="min-h-screen bg-[#F4F6F5] pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-7 pt-8">

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        Students of East Africa
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        My Profile
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Your SEAConnect account
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Profile Card */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0C2340] text-2xl font-bold text-white">
                            {initials}
                        </div>

                        <h2 className="mt-4 text-2xl font-bold">
                            {fullName}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {position}
                        </p>

                        <span className="mt-3 rounded-full bg-[#F15A24]/10 px-3 py-1 text-xs font-semibold text-[#F15A24]">
                            {role === "officer"
                                ? "Officer"
                                : "SEA Member"}
                        </span>

                    </div>

                </section>

                {/* Account Information */}
                <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold">
                        Account Information
                    </h2>

                    <div className="mt-5">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Name
                        </p>

                        <p className="mt-1 font-medium">
                            {fullName}
                        </p>

                    </div>

                    <div className="mt-5">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Email
                        </p>

                        <p className="mt-1 break-all font-medium">
                            {email}
                        </p>

                    </div>

                    <div className="mt-5">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Country
                        </p>

                        <p className="mt-1 font-medium">
                            {country}
                        </p>

                    </div>

                    <div className="mt-5">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Position
                        </p>

                        <p className="mt-1 font-medium">
                            {position}
                        </p>

                    </div>

                </section>

                {/* About SEAConnect */}
                <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold">
                        About SEAConnect
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        SEAConnect is the digital hub for the
                        Students of East Africa community at UTSA.
                    </p>

                </section>

            </div>

            <BottomNav />

        </main>
    );
}