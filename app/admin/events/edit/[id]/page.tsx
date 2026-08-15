"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();

    const supabase = createSupabaseBrowserClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadEvent() {
            const { data, error } = await supabase
                .from("events")
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
            setEventDate(data.event_date || "");
            setEventTime(data.event_time || "");
            setLocation(data.location || "");

            setLoading(false);
        }

        loadEvent();
    }, [params.id]);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setSaving(true);
        setError("");

        const { error } = await supabase
            .from("events")
            .update({
                title,
                description,
                event_date: eventDate,
                event_time: eventTime,
                location,
            })
            .eq("id", params.id);

        if (error) {
            setError(error.message);
            setSaving(false);
            return;
        }

        router.push("/admin/events");
        router.refresh();
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setSaving(true);
        setError("");

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", params.id);

        if (error) {
            setError(error.message);
            setSaving(false);
            return;
        }

        router.push("/admin/events");
        router.refresh();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 text-[#0C2340]">
                <p>Loading event...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 text-[#0C2340]">

            {/* Header */}
            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">
                <div className="mx-auto max-w-md">

                    <button
                        onClick={() => router.back()}
                        className="text-sm text-gray-300 transition hover:text-white"
                    >
                        ← Back
                    </button>

                    <h1 className="mt-5 text-3xl font-bold">
                        Edit Event
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Update SEA event information.
                    </p>

                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Event Title */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Event Title
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

                    {/* Description */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            rows={4}
                            className="mt-2 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Date */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Date
                        </label>

                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) =>
                                setEventDate(e.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Time */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Time
                        </label>

                        <input
                            type="time"
                            value={eventTime}
                            onChange={(e) =>
                                setEventTime(e.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Location */}
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

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Save */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-xl bg-[#F15A24] px-4 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                    {/* Delete */}
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-4 font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                        {saving
                            ? "Processing..."
                            : "Delete Event"}
                    </button>

                </form>

            </div>

        </main>
    );
}