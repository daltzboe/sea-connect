import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getCurrentProfile } from "@/lib/profile";
import DeleteUserButton from "@/components/DeleteUserButton";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ManageUserPage({ params }: PageProps) {
    const { id } = await params;

    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    if (profile?.role !== "officer") {
        redirect("/dashboard");
    }

    const supabase = await createSupabaseServerClient();

    const { data: managedUser, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error || !managedUser) {
        redirect("/admin/users");
    }

    async function deleteUser() {
        "use server";

        const supabase = await createSupabaseServerClient();

        const {
            data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
            redirect("/signin");
        }

        // Verify the person performing the action is an officer
        const { data: currentProfile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();

        if (currentProfile?.role !== "officer") {
            redirect("/dashboard");
        }

        // Prevent officers from deleting themselves
        if (id === currentUser.id) {
            redirect(`/admin/users/${id}`);
        }

        const adminSupabase = createSupabaseAdminClient();

        // Delete authentication account
        const { error: authError } =
            await adminSupabase.auth.admin.deleteUser(id);

        if (authError) {
            throw new Error(authError.message);
        }

        // Delete profile
        const { error: profileError } =
            await adminSupabase
                .from("profiles")
                .delete()
                .eq("id", id);

        if (profileError) {
            throw new Error(profileError.message);
        }

        redirect("/admin/users");
    }

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">
                <div className="mx-auto max-w-md">

                    <Link
                        href="/admin/users"
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Users
                    </Link>

                    <p className="mt-5 text-sm text-[#F4C430]">
                        Administration
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Manage User
                    </h1>

                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* User */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0C2340] text-xl font-bold text-white">
                            {managedUser.full_name
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
                            <h2 className="text-xl font-bold">
                                {managedUser.full_name ||
                                    "SEA Member"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {managedUser.country ||
                                    "Country not provided"}
                            </p>
                        </div>

                    </div>

                </section>

                {/* Account Information */}
                <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold">
                        Account Information
                    </h2>

                    <div className="mt-5 space-y-5">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Full Name
                            </p>

                            <p className="mt-1 font-medium">
                                {managedUser.full_name ||
                                    "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Country
                            </p>

                            <p className="mt-1 font-medium">
                                {managedUser.country ||
                                    "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Position
                            </p>

                            <p className="mt-1 font-medium">
                                {managedUser.position ||
                                    "SEA Member"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Current Role
                            </p>

                            <span className="mt-2 inline-flex rounded-full bg-[#F15A24]/10 px-3 py-1 text-xs font-semibold text-[#F15A24]">
                                {managedUser.role === "officer"
                                    ? "Officer"
                                    : "Member"}
                            </span>
                        </div>

                    </div>

                </section>

                {/* Edit Profile */}
                <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold">
                        Edit Profile
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Update this user's profile information.
                    </p>

                    <form
                        action={async (formData) => {
                            "use server";

                            const supabase =
                                await createSupabaseServerClient();

                            const {
                                data: {
                                    user: currentUser,
                                },
                            } = await supabase.auth.getUser();

                            if (!currentUser) {
                                redirect("/signin");
                            }

                            // Verify current user is an officer
                            const { data: currentProfile } =
                                await supabase
                                    .from("profiles")
                                    .select("role")
                                    .eq("id", currentUser.id)
                                    .single();

                            if (currentProfile?.role !== "officer") {
                                redirect("/dashboard");
                            }

                            const fullName =
                                String(formData.get("full_name") || "").trim();

                            const country =
                                String(formData.get("country") || "").trim();

                            const position =
                                String(formData.get("position") || "").trim();

                            const { error } = await supabase
                                .from("profiles")
                                .update({
                                    full_name: fullName || "SEA Member",
                                    country: country || null,
                                    position: position || "SEA Member",
                                })
                                .eq("id", id);

                            if (error) {
                                throw new Error(error.message);
                            }

                            redirect(`/admin/users/${id}`);
                        }}
                    >

                        {/* Full Name */}
                        <div className="mt-5">

                            <label
                                htmlFor="full_name"
                                className="text-sm font-semibold"
                            >
                                Full Name
                            </label>

                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                defaultValue={managedUser.full_name || ""}
                                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                            />

                        </div>

                        {/* Country */}
                        <div className="mt-5">

                            <label
                                htmlFor="country"
                                className="text-sm font-semibold"
                            >
                                Country
                            </label>

                            <input
                                id="country"
                                name="country"
                                type="text"
                                defaultValue={managedUser.country || ""}
                                placeholder="Example: Tanzania"
                                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                            />

                        </div>

                        {/* Position */}
                        <div className="mt-5">

                            <label
                                htmlFor="position"
                                className="text-sm font-semibold"
                            >
                                Position
                            </label>

                            <input
                                id="position"
                                name="position"
                                type="text"
                                defaultValue={managedUser.position || ""}
                                placeholder="Example: President"
                                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                            />

                        </div>

                        {/* Bio */}
                        <div className="mt-5">

                            <label
                                htmlFor="bio"
                                className="text-sm font-semibold"
                            >
                                Bio
                                <span className="ml-1 font-normal text-gray-400">
                    (optional)
                </span>
                            </label>

                            <textarea
                                id="bio"
                                name="bio"
                                rows={4}
                                defaultValue={managedUser.bio || ""}
                                placeholder="Short description about this user"
                                className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                            />

                        </div>

                        <button
                            type="submit"
                            className="mt-6 w-full rounded-xl bg-[#0C2340] px-4 py-3 font-semibold text-white transition hover:opacity-90"
                        >
                            Save Profile Changes
                        </button>

                    </form>

                </section>

                {/* Role Management */}
                <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold">
                        Role Management
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Officers can promote users to officers
                        or return officers to regular members.
                    </p>

                    {managedUser.id === user.id ? (

                        <div className="mt-5 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
                            You cannot change your own role.
                        </div>

                    ) : managedUser.role === "officer" ? (

                        <form
                            action={async () => {
                                "use server";

                                const supabase =
                                    await createSupabaseServerClient();

                                const {
                                    data: {
                                        user: currentUser,
                                    },
                                } =
                                    await supabase.auth.getUser();

                                if (!currentUser) {
                                    redirect("/signin");
                                }

                                const {
                                    data: currentProfile,
                                } = await supabase
                                    .from("profiles")
                                    .select("role")
                                    .eq(
                                        "id",
                                        currentUser.id
                                    )
                                    .single();

                                if (
                                    currentProfile?.role !==
                                    "officer"
                                ) {
                                    redirect("/dashboard");
                                }

                                const { error } =
                                    await supabase
                                        .from("profiles")
                                        .update({
                                            role: "member",
                                        })
                                        .eq("id", id);

                                if (error) {
                                    throw new Error(
                                        error.message
                                    );
                                }

                                redirect("/admin/users");
                            }}
                        >
                            <button
                                type="submit"
                                className="mt-5 w-full rounded-xl bg-gray-200 px-4 py-3 font-semibold text-[#0C2340] transition hover:bg-gray-300"
                            >
                                Demote to Member
                            </button>
                        </form>

                    ) : (

                        <form
                            action={async () => {
                                "use server";

                                const supabase =
                                    await createSupabaseServerClient();

                                const {
                                    data: {
                                        user: currentUser,
                                    },
                                } =
                                    await supabase.auth.getUser();

                                if (!currentUser) {
                                    redirect("/signin");
                                }

                                const {
                                    data: currentProfile,
                                } = await supabase
                                    .from("profiles")
                                    .select("role")
                                    .eq(
                                        "id",
                                        currentUser.id
                                    )
                                    .single();

                                if (
                                    currentProfile?.role !==
                                    "officer"
                                ) {
                                    redirect("/dashboard");
                                }

                                const { error } =
                                    await supabase
                                        .from("profiles")
                                        .update({
                                            role: "officer",
                                        })
                                        .eq("id", id);

                                if (error) {
                                    throw new Error(
                                        error.message
                                    );
                                }

                                redirect("/admin/users");
                            }}
                        >
                            <button
                                type="submit"
                                className="mt-5 w-full rounded-xl bg-[#16803A] px-4 py-3 font-semibold text-white transition hover:opacity-90"
                            >
                                Promote to Officer
                            </button>
                        </form>

                    )}

                </section>

                {/* Delete User */}
                {managedUser.id !== user.id && (
                    <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                        <h2 className="font-bold text-red-600">
                            Delete User
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Permanently removes this user's
                            SEAConnect account. This cannot be
                            undone.
                        </p>

                        <DeleteUserButton
                            action={deleteUser}
                        />

                    </section>
                )}

                {/* Important */}
                <section className="mt-5 rounded-2xl border border-[#F4C430]/40 bg-[#F4C430]/10 p-5">

                    <h3 className="font-bold">
                        Important
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Changing a user's role does not
                        automatically add or remove them from
                        the active SEA member directory.
                    </p>

                </section>

            </div>

        </main>
    );
}