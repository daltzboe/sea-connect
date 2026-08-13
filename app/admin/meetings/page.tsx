import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DeleteMeetingButton from "@/components/DeleteMeetingButton";

export default async function AdminMeetingsPage() {
    const { user, profile } = await getCurrentProfile();

    if (!user) {
        redirect("/signin");
    }

    if (profile?.role !== "officer") {
        redirect("/dashboard");
    }

    const supabase = await createSupabaseServerClient();

    const { data: meetings, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: true });

    return (
        <main className="min-h-screen bg-gray-100 text-[#0C2340]">

            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">
                <div className="mx-auto max-w-md">

                    <Link
                        href="/admin"
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Admin
                    </Link>

                    <h1 className="mt-5 text-3xl font-bold">
                        Manage Meetings
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Create and manage SEA meetings.
                    </p>

                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <Link
                    href="/admin/meetings/create"
                    className="block rounded-2xl bg-[#F15A24] px-5 py-4 text-center font-bold text-white shadow-sm"
                >
                    + Create Meeting
                </Link>

                <div className="mt-6 space-y-4">

                    {error && (
                        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
                            {error.message}
                        </div>
                    )}

                    {!error &&
                        (!meetings || meetings.length === 0) && (
                            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                                <div className="text-4xl">
                                    🤝
                                </div>

                                <h2 className="mt-4 text-lg font-bold">
                                    No meetings yet
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    Create a meeting to get started.
                                </p>
                            </div>
                        )}

                    {meetings?.map((meeting) => (
                        <div
                            key={meeting.id}
                            className="rounded-2xl bg-white p-5 shadow-sm"
                        >
                            <h2 className="font-bold">
                                {meeting.title}
                            </h2>

                            {meeting.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                    {meeting.description}
                                </p>
                            )}

                            <p className="mt-3 text-sm text-gray-500">
                                📅 {meeting.meeting_date}
                            </p>

                            {meeting.meeting_time && (
                                <p className="text-sm text-gray-500">
                                    🕐 {meeting.meeting_time}
                                </p>
                            )}

                            {meeting.location && (
                                <p className="text-sm text-gray-500">
                                    📍 {meeting.location}
                                </p>
                            )}

                            <div className="mt-4 flex gap-3">

                                <Link
                                    href={`/admin/meetings/edit/${meeting.id}`}
                                    className="flex-1 rounded-xl bg-[#0C2340] px-4 py-3 text-center text-sm font-semibold text-white"
                                >
                                    Edit
                                </Link>

                                <DeleteMeetingButton
                                    meetingId={meeting.id}
                                />

                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </main>
    );
}