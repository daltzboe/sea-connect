"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = e.target.files?.[0];

        setError("");
        setImage(null);
        setImagePreview("");

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Please choose a JPG, PNG, or WebP image.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("The image must be 5 MB or smaller.");
            e.target.value = "";
            return;
        }

        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description);
            formData.append("eventDate", eventDate);
            formData.append("eventTime", eventTime);
            formData.append("location", location);

            if (image) {
                formData.append("image", image);
            }

            const response = await fetch("/api/events/create", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to create event."
                );
            }

            router.push("/admin/events");
            router.refresh();
        } catch (error) {
            console.error("Failed to create event:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create event."
            );

            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 text-[#0C2340]">
            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">
                <div className="mx-auto max-w-md">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back
                    </button>

                    <h1 className="mt-5 text-3xl font-bold">
                        Create Event
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Add a new SEA event.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <label className="text-sm font-semibold">
                            Event Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="SEA Welcome Back Event"
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
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell members about the event..."
                            rows={4}
                            className="mt-2 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <label className="text-sm font-semibold">
                            Date
                        </label>

                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
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
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
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
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Campus location"
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <label className="text-sm font-semibold">
                            Event Photo (Optional)
                        </label>

                        <p className="mt-1 text-sm text-gray-500">
                            Choose a JPG, PNG, or WebP image up to 5 MB.
                        </p>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0C2340] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90"
                        />

                        {imagePreview && (
                            <div className="mt-4">
                                <img
                                    src={imagePreview}
                                    alt="Event photo preview"
                                    className="max-h-64 w-full rounded-xl object-cover"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview("");
                                    }}
                                    className="mt-2 text-sm font-semibold text-red-600"
                                >
                                    Remove photo
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#F15A24] px-4 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? "Creating Event..." : "Create Event"}
                    </button>
                </form>
            </div>
        </main>
    );
}