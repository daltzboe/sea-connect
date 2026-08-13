"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function CreateMemberPage() {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [fullName, setFullName] = useState("");
    const [position, setPosition] = useState("");
    const [country, setCountry] = useState("");
    const [bio, setBio] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const { error } = await supabase
            .from("members")
            .insert({
                full_name: fullName,
                position,
                country,
                bio,
            });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/admin/members");
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
                        Add Member
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Add a SEA member.
                    </p>

                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Full Name */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                            placeholder="Dalton Opudo"
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Position */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Position
                        </label>

                        <input
                            type="text"
                            value={position}
                            onChange={(e) =>
                                setPosition(e.target.value)
                            }
                            placeholder="Member"
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Country */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Country
                        </label>

                        <input
                            type="text"
                            value={country}
                            onChange={(e) =>
                                setCountry(e.target.value)
                            }
                            placeholder="Tanzania"
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Bio */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Bio
                        </label>

                        <textarea
                            value={bio}
                            onChange={(e) =>
                                setBio(e.target.value)
                            }
                            placeholder="Tell us about this member..."
                            rows={5}
                            className="mt-2 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
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
                            ? "Adding Member..."
                            : "Add Member"}
                    </button>

                </form>

            </div>

        </main>
    );
}