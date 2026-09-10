import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import BottomNav from "@/components/BottomNav";

export default async function ManageMembersPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    // Get current user's profile
    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    // Only officers can access this page
    if (currentProfile?.role !== "officer") {
        redirect("/dashboard");
    }

    // Get all profiles
    const { data: members, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

    return (
        <main className="min-h-screen bg-[#F4F6F5] pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/admin"
                        prefetch={true}
                        className="inline-flex items-center text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Admin
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        Administration
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Manage Members
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        View and manage SEAConnect members.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

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

                {/* Member count */}
                {!error && (
                    <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Total Members
                        </p>

                        <p className="mt-1 text-3xl font-bold">
                            {members?.length || 0}
                        </p>

                    </div>
                )}

                {/* Members */}
                <div className="space-y-4">

                    {members?.map((member) => {

                        const initials = (member.full_name || "SEA")
                            .split(" ")
                            .map((name: string) =>
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

                                    {/* Avatar */}
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0C2340] font-bold text-white">
                                        {initials}
                                    </div>

                                    {/* Information */}
                                    <div className="min-w-0 flex-1">

                                        <h2 className="truncate font-bold">
                                            {member.full_name}
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {member.position ||
                                                "SEA Member"}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {member.country ||
                                                "Country not provided"}
                                        </p>

                                    </div>

                                    {/* Role */}
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            member.role === "officer"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {member.role === "officer"
                                            ? "Officer"
                                            : "Member"}
                                    </span>

                                </div>

                                {/* Management */}
                                <div className="mt-5 border-t border-gray-100 pt-4">

                                    <Link
                                        href={`/admin/manage-members/${member.id}`}
                                        prefetch={true}
                                        className="block w-full rounded-xl bg-[#0C2340] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                                    >
                                        Manage Member
                                    </Link>

                                </div>

                            </article>
                        );
                    })}

                </div>

                {/* Empty state */}
                {!error &&
                    (!members || members.length === 0) && (
                        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

                            <div className="text-4xl">
                                👥
                            </div>

                            <h2 className="mt-4 text-lg font-bold">
                                No members yet
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                New SEAConnect accounts will
                                appear here automatically.
                            </p>

                        </div>
                    )}

            </div>

            <BottomNav />

        </main>
    );
}