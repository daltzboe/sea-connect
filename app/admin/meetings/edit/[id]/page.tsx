"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function EditMeetingPage() {
    const router = useRouter();
    const params = useParams();

    const supabase = createSupabaseBrowserClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadMeeting() {
            const { data, error } = await supabase
                .from("meetings")
                .select("*")
                .eq("id", params.id)
                .single();

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setTitle(data.title || "");
            setDescription(data.description || "");
            setMeetingDate(data.meeting_date || "");
            setMeetingTime(data.meeting_time || "");
            setLocation(data.location || "");

            setLoading(false);
        }

        loadMeeting();
    }, [params.id]);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setSaving(true);
        setError("");

        const { error } = await supabase
            .from("meetings")
            .update({
                title,
                description,
                meeting_date: meetingDate,
                meeting_time: meetingTime,
                location,
            })
            .eq("id", params.id);

        if (error) {
            setError(error.message);
            setSaving(false);
            return;
        }

        router.push("/admin/meetings");
        router.refresh();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 text-[#0C2340]">
                <p>Loading meeting...</p>
            </main>
        );
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this meeting? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setSaving(true);
        setError("");

        const { error } = await supabase
            .from("meetings")
            .delete()
            .eq("id", params.id);

        if (error) {
            setError(error.message);
            setSaving(false);
            return;
        }

        router.push("/admin/meetings");
        router.refresh();
    }

    return (
        <main className="min-h-screen bg-gray-100 text-[#0C2340]">

            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">
                <div className="mx-auto max-w-md">

                    <button
                        onClick={() => router.back()}
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back
                    </button>

                    <h1 className="mt-5 text-3xl font-bold">
                        Edit Meeting
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Update this SEA meeting.
                    </p>

                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Meeting Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            rows={5}
                            className="mt-2 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Date
                        </label>

                        <input
                            type="date"
                            value={meetingDate}
                            onChange={(e) =>
                                setMeetingDate(e.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Time
                        </label>

                        <input
                            type="time"
                            value={meetingTime}
                            onChange={(e) =>
                                setMeetingTime(e.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Location
                        </label>

                        <input
                            type="text"
                            value={location}
                            onChange={(e) =>
                                setLocation(e.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-xl bg-[#F15A24] px-4 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving Changes..."
                            : "Save Changes"}
                    </button>

                </form>

            </div>

        </main>
    );
}