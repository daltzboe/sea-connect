import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import BottomNav from "@/components/BottomNav";

export default async function AnnouncementsPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    const { data: announcements, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">

            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-[#F15A24] opacity-20 blur-3xl" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        SEAConnect
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Announcements
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Stay connected with the latest news from
                        Students of East Africa.
                    </p>

                    <div className="mt-5 flex gap-2 text-xl">
                        📢 🇹🇿 🇰🇪 🇺🇬
                    </div>

                </div>

            </header>

            <div className="mx-auto max-w-md space-y-5 px-5 py-6">

                {error && (
                    <div className="rounded-2xl bg-red-50 p-5 text-red-600">
                        {error.message}
                    </div>
                )}

                {!error && (!announcements || announcements.length === 0) && (
                    <div className="rounded-3xl bg-white p-8 text-center shadow-md">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-3xl">
                            📢
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-[#0C2340]">
                            No announcements yet
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Stay tuned! New announcements from the
                            Students of East Africa organization will
                            appear here.
                        </p>

                    </div>
                )}

                {announcements?.map((announcement) => (
                    <article
                        key={announcement.id}
                        className="rounded-2xl bg-white p-5 shadow-sm"
                    >

                        <h2 className="text-xl font-bold">
                            {announcement.title}
                        </h2>

                        <p className="mt-4 leading-7 text-gray-600">
                            {announcement.content}
                        </p>

                        <p className="mt-5 text-xs text-gray-400">
                            Posted{" "}
                            {new Date(
                                announcement.created_at
                            ).toLocaleDateString()}
                        </p>

                    </article>
                ))}

            </div>

            <BottomNav />

        </main>
    );
}