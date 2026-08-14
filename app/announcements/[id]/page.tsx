import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import BottomNav from "@/components/BottomNav";

type AnnouncementPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AnnouncementDetailsPage({
                                                          params,
                                                      }: AnnouncementPageProps) {
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    const { data: announcement, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !announcement) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-[#F15A24] opacity-20 blur-3xl" />

                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#16803A] opacity-20 blur-3xl" />

                <div className="relative mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/announcements"
                        className="inline-flex items-center text-sm text-gray-300 transition hover:text-white"
                    >
                        ← Back to Announcements
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                        SEAConnect
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Announcement
                    </h1>

                    <div className="mt-4 text-xl">
                        📢 🇹🇿 🇰🇪 🇺🇬 🇷🇼 🇸🇴
                    </div>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Announcement Card */}
                <article className="overflow-hidden rounded-2xl bg-white shadow-sm">

                    <div className="h-1 bg-[#F4C430]" />

                    <div className="p-6">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
                            📢
                        </div>

                        <h2 className="mt-5 text-2xl font-bold">
                            {announcement.title}
                        </h2>

                        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-600">
                            {announcement.content}
                        </p>

                        <div className="mt-7 border-t border-gray-100 pt-5">

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Posted
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {new Date(
                                    announcement.created_at
                                ).toLocaleDateString(
                                    "en-US",
                                    {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    }
                                )}
                            </p>

                        </div>

                    </div>

                </article>

                {/* Back Button */}
                <Link
                    href="/announcements"
                    className="mt-5 block w-full rounded-xl bg-[#F4C430] px-4 py-3 text-center font-bold text-[#0C2340] transition hover:opacity-90"
                >
                    View All Announcements
                </Link>

                {/* Community Footer */}
                <section className="mt-6 overflow-hidden rounded-2xl bg-[#071522] text-center text-white">

                    <div className="flex h-1">
                        <div className="flex-1 bg-[#16803A]" />
                        <div className="flex-1 bg-[#F4C430]" />
                        <div className="flex-1 bg-[#F15A24]" />
                    </div>

                    <div className="p-6">

                        <p className="text-lg">
                            🇹🇿 🇰🇪 🇺🇬 🇷🇼 🇸🇴
                        </p>

                        <h2 className="mt-3 font-bold">
                            Students of East Africa
                        </h2>

                        <p className="mt-2 text-sm text-gray-400">
                            Connecting our community at UTSA.
                        </p>

                    </div>

                </section>

            </div>

            <BottomNav />

        </main>
    );
}