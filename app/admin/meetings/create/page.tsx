"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function CreateMeetingPage() {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const { error } = await supabase
            .from("meetings")
            .insert({
                title,
                description,
                meeting_date: meetingDate,
                meeting_time: meetingTime,
                location,
            });

        if (error) {
            setError(error.message);
            setLoading(false);
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
                        Create Meeting
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Add a new SEA meeting.
                    </p>

                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Title */}
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
                            placeholder="SEA General Meeting"
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
                            placeholder="Meeting details..."
                            rows={5}
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
                            value={meetingDate}
                            onChange={(e) =>
                                setMeetingDate(e.target.value)
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
                            value={meetingTime}
                            onChange={(e) =>
                                setMeetingTime(e.target.value)
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
                            placeholder="UTSA Campus"
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#F15A24] px-4 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        {loading
                            ? "Creating Meeting..."
                            : "Create Meeting"}
                    </button>

                </form>

            </div>

        </main>
    );
}