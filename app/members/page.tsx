import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import BottomNav from "@/components/BottomNav";

export default async function MembersPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    const { data: members, error } = await supabase
        .from("members")
        .select("*")
        .order("full_name", { ascending: true });

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                {/* SEA Accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                {/* Background Glow */}
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
                        Members
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-300">
                        Meet the students who make up the
                        Students of East Africa community at UTSA.
                    </p>

                    <div className="mt-5 flex gap-2 text-xl">
                        👥 🇹🇿 🇰🇪 🇺🇬
                    </div>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Member Count */}
                {!error && members && members.length > 0 && (
                    <div className="mb-5 flex items-center justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Community
                            </p>

                            <h2 className="mt-1 text-lg font-bold">
                                {members.length}{" "}
                                {members.length === 1
                                    ? "Member"
                                    : "Members"}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16803A]/10 text-xl">
                            👥
                        </div>

                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">

                        <p className="font-semibold">
                            Unable to load members.
                        </p>

                        <p className="mt-2 text-xs">
                            {error.message}
                        </p>

                    </div>
                )}

                {/* Empty State */}
                {!error &&
                    (!members || members.length === 0) && (
                        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                                🌍
                            </div>

                            <h2 className="mt-5 text-xl font-bold">
                                No members yet
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                The SEA member directory is
                                currently empty. Check back soon.
                            </p>

                        </section>
                    )}

                {/* Member Cards */}
                <div className="space-y-4">

                    {members?.map((member) => {

                        const initials = member.full_name
                            ?.split(" ")
                            .filter(Boolean)
                            .map(
                                (name: string) =>
                                    name.charAt(0)
                            )
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                        const isOfficer =
                            member.position &&
                            member.position.toLowerCase() !==
                            "sea member";

                        return (
                            <article
                                key={member.id}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >

                                {/* Top Accent */}
                                <div
                                    className={`h-1 ${
                                        isOfficer
                                            ? "bg-[#F4C430]"
                                            : "bg-[#16803A]"
                                    }`}
                                />

                                <div className="p-5">

                                    {/* Identity */}
                                    <div className="flex items-center gap-4">

                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0C2340] text-lg font-bold text-white shadow-sm">
                                            {initials || "SEA"}
                                        </div>

                                        <div className="min-w-0">

                                            <h2 className="truncate text-lg font-bold">
                                                {member.full_name}
                                            </h2>

                                            <div className="mt-1">

                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        isOfficer
                                                            ? "bg-yellow-50 text-[#8A6A00]"
                                                            : "bg-green-50 text-[#16803A]"
                                                    }`}
                                                >
                                                    {member.position ||
                                                        "SEA Member"}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Details */}
                                    {(member.country ||
                                        member.bio) && (
                                        <div className="mt-5 border-t border-gray-100 pt-4">

                                            {member.country && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="text-base">
                                                        🌍
                                                    </span>

                                                    <span>
                                                        {member.country}
                                                    </span>
                                                </div>
                                            )}

                                            {member.bio && (
                                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                                    {member.bio}
                                                </p>
                                            )}

                                        </div>
                                    )}

                                </div>

                            </article>
                        );
                    })}

                </div>

                {/* Community Footer */}
                {!error &&
                    members &&
                    members.length > 0 && (
                        <section className="mt-8 overflow-hidden rounded-2xl bg-[#071522] text-center text-white">

                            <div className="flex h-1">
                                <div className="flex-1 bg-[#16803A]" />
                                <div className="flex-1 bg-[#F4C430]" />
                                <div className="flex-1 bg-[#F15A24]" />
                            </div>

                            <div className="p-6">

                                <div className="text-2xl">
                                    🌍 🤝
                                </div>

                                <h3 className="mt-3 font-bold">
                                    One community. Many countries.
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-gray-400">
                                    Students of East Africa • UTSA
                                </p>

                            </div>

                        </section>
                    )}

            </div>

            <BottomNav />

        </main>
    );
}