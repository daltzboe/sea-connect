import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

export default async function AdminMembersPage() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    if (profile?.role !== "officer") {
        redirect("/dashboard");
    }

    const supabase = await createSupabaseServerClient();

    const { data: members, error } = await supabase
        .from("members")
        .select("*")
        .order("full_name", { ascending: true });

    return (
        <main className="min-h-screen bg-gray-100 pb-10 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="h-1 bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-7 pt-8">

                    <Link
                        href="/admin"
                        prefetch={true}
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Admin
                    </Link>

                    <p className="mt-5 text-sm text-[#F4C430]">
                        Administration
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Active Members
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Manage the official SEA member directory.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Add Member */}
                <Link
                    href="/admin/members/add"
                    prefetch={true}
                    className="mb-6 flex w-full items-center justify-center rounded-xl bg-[#16803A] px-4 py-3 font-semibold text-white transition hover:opacity-90"
                >
                    + Add Active Member
                </Link>

                {/* Error */}
                {error && (
                    <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
                        <p className="font-semibold">
                            Unable to load members.
                        </p>

                        <p className="mt-2">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!error && (!members || members.length === 0) && (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

                        <div className="text-4xl">
                            🌍
                        </div>

                        <h2 className="mt-4 text-lg font-bold">
                            No active members yet
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Add people to the official SEA member
                            directory using the button above.
                        </p>

                    </div>
                )}

                {/* Members */}
                <div className="space-y-4">

                    {members?.map((member) => (
                        <article
                            key={member.id}
                            className="rounded-2xl bg-white p-5 shadow-sm"
                        >

                            <div className="flex items-start justify-between gap-4">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0C2340] font-bold text-white">
                                        {member.full_name
                                            ?.split(" ")
                                            .filter(Boolean)
                                            .map(
                                                (name: string) =>
                                                    name.charAt(0)
                                            )
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <h2 className="font-bold">
                                            {member.full_name}
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {member.position ||
                                                "SEA Member"}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">

                                {member.country && (
                                    <div className="flex gap-3">

                                        <span>
                                            🌍
                                        </span>

                                        <p className="text-sm font-medium">
                                            {member.country}
                                        </p>

                                    </div>
                                )}

                                {member.bio && (
                                    <p className="text-sm leading-6 text-gray-500">
                                        {member.bio}
                                    </p>
                                )}

                            </div>

                            <Link
                                href={`/admin/members/${member.id}`}
                                prefetch={true}
                                className="mt-5 block w-full rounded-xl bg-[#0C2340] px-4 py-3 text-center text-sm font-semibold text-white"
                            >
                                Manage Member
                            </Link>

                        </article>
                    ))}

                </div>

            </div>

        </main>
    );
}