import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

export default async function AdminUsersPage() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    if (profile?.role !== "officer") {
        redirect("/dashboard");
    }

    const supabase = await createSupabaseServerClient();

    const { data: users, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", {
            ascending: true,
        });

    return (
        <main className="min-h-screen bg-gray-100 pb-10 text-[#0C2340]">

            {/* Header */}
            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">

                <div className="mx-auto max-w-md">

                    <Link
                        href="/admin"
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Admin
                    </Link>

                    <p className="mt-5 text-sm text-[#F4C430]">
                        Administration
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Users
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Manage SEAConnect accounts and roles.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Error */}
                {error && (
                    <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
                        Unable to load users.
                    </div>
                )}

                {/* User Count */}
                {!error && (
                    <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Registered Users
                        </p>

                        <p className="mt-1 text-3xl font-bold">
                            {users?.length || 0}
                        </p>

                    </div>
                )}

                {/* Empty */}
                {!error &&
                    (!users || users.length === 0) && (
                        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

                            <div className="text-4xl">
                                👥
                            </div>

                            <h2 className="mt-4 font-bold">
                                No users found
                            </h2>

                        </div>
                    )}

                {/* Users */}
                <div className="space-y-4">

                    {users?.map((managedUser) => {

                        const initials =
                            managedUser.full_name
                                ?.split(" ")
                                .filter(Boolean)
                                .map(
                                    (name: string) =>
                                        name.charAt(0)
                                )
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                        const isCurrentUser =
                            managedUser.id === user.id;

                        return (
                            <article
                                key={managedUser.id}
                                className="rounded-2xl bg-white p-5 shadow-sm"
                            >

                                <div className="flex items-start justify-between gap-4">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0C2340] font-bold text-white">
                                            {initials || "??"}
                                        </div>

                                        <div>

                                            <h2 className="font-bold">
                                                {managedUser.full_name ||
                                                    "SEA Member"}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {managedUser.country ||
                                                    "Country not provided"}
                                            </p>

                                        </div>

                                    </div>

                                    {isCurrentUser && (
                                        <span className="rounded-full bg-[#0C2340]/10 px-2 py-1 text-xs font-semibold">
                                            You
                                        </span>
                                    )}

                                </div>

                                <div className="mt-4 border-t border-gray-100 pt-4">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                                Position
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {managedUser.position ||
                                                    "SEA Member"}
                                            </p>

                                        </div>

                                        <span
                                            className={
                                                managedUser.role ===
                                                "officer"
                                                    ? "rounded-full bg-[#16803A]/10 px-3 py-1 text-xs font-semibold text-[#16803A]"
                                                    : "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                                            }
                                        >
                                            {managedUser.role ===
                                            "officer"
                                                ? "Officer"
                                                : "Member"}
                                        </span>

                                    </div>

                                </div>

                                <Link
                                    href={`/admin/users/${managedUser.id}`}
                                    className="mt-5 block w-full rounded-xl bg-[#0C2340] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                                >
                                    {isCurrentUser
                                        ? "View My Account"
                                        : "Manage User"}
                                </Link>

                            </article>
                        );
                    })}

                </div>

            </div>

        </main>
    );
}