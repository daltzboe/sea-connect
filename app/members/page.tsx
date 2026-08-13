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

                <div className="h-1 bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/dashboard"
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        Students of East Africa
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        SEA Members
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Meet the active members of our community.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Error */}
                {error && (
                    <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
                        Unable to load members.
                    </div>
                )}

                {/* Empty State */}
                {!error &&
                    (!members || members.length === 0) && (
                        <section className="rounded-2xl bg-white p-8 text-center shadow-sm">

                            <div className="text-5xl">
                                🌍
                            </div>

                            <h2 className="mt-4 text-lg font-bold">
                                No active members yet
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                The SEA member directory is
                                currently empty.
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

                        return (
                            <article
                                key={member.id}
                                className="rounded-2xl bg-white p-5 shadow-sm"
                            >

                                <div className="flex items-center gap-4">

                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0C2340] text-lg font-bold text-white">
                                        {initials}
                                    </div>

                                    <div className="min-w-0">

                                        <h2 className="truncate text-lg font-bold">
                                            {member.full_name}
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {member.position ||
                                                "SEA Member"}
                                        </p>

                                    </div>

                                </div>

                                <div className="mt-4 space-y-2">

                                    {member.country && (
                                        <p className="text-sm text-gray-600">
                                            🌍 {member.country}
                                        </p>
                                    )}

                                    {member.bio && (
                                        <p className="text-sm leading-6 text-gray-500">
                                            {member.bio}
                                        </p>
                                    )}

                                </div>

                            </article>
                        );
                    })}

                </div>

            </div>

            <BottomNav />

        </main>
    );
}