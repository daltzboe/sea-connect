import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ManageMemberForm from "@/components/ManageMemberForm";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ManageMemberPage({
                                                   params,
                                               }: PageProps) {
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    // Check current user's role
    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    // Only officers can manage members
    if (currentProfile?.role !== "officer") {
        redirect("/dashboard");
    }

    // Get selected member
    const { data: member, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error || !member) {
        redirect("/admin/manage-members");
    }

    return (
        <main className="min-h-screen bg-[#F4F6F5] pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/admin/manage-members"
                        className="inline-flex items-center text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Members
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        Administration
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Manage Member
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Update this member's SEAConnect profile.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Member Preview */}
                <section className="rounded-3xl bg-white p-6 text-center shadow-sm">

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0C2340] text-2xl font-bold text-white">
                        {(member.full_name || "SEA")
                            .split(" ")
                            .map((name: string) =>
                                name.charAt(0)
                            )
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>

                    <h2 className="mt-4 text-xl font-bold">
                        {member.full_name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {member.country || "Country not provided"}
                    </p>

                </section>

                {/* Management Form */}
                <ManageMemberForm member={member} />

            </div>

        </main>
    );
}