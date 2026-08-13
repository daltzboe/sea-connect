"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function EditMemberPage() {
    const router = useRouter();
    const params = useParams();

    const supabase = createSupabaseBrowserClient();

    const [fullName, setFullName] = useState("");
    const [position, setPosition] = useState("");
    const [country, setCountry] = useState("");
    const [bio, setBio] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadMember() {
            const { data, error } = await supabase
                .from("members")
                .select("*")
                .eq("id", params.id)
                .single();

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setFullName(data.full_name || "");
            setPosition(data.position || "");
            setCountry(data.country || "");
            setBio(data.bio || "");

            setLoading(false);
        }

        loadMember();
    }, [params.id]);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setSaving(true);
        setError("");

        const { error } = await supabase
            .from("members")
            .update({
                full_name: fullName,
                position,
                country,
                bio,
            })
            .eq("id", params.id);

        if (error) {
            setError(error.message);
            setSaving(false);
            return;
        }

        router.push("/admin/members");
        router.refresh();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 text-[#0C2340]">
                <p>Loading member...</p>
            </main>
        );
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
                        Edit Member
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Update member information.
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
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

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
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

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
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <label className="text-sm font-semibold">
                            Bio
                        </label>

                        <textarea
                            value={bio}
                            onChange={(e) =>
                                setBio(e.target.value)
                            }
                            rows={5}
                            className="mt-2 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-[#F15A24]"
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