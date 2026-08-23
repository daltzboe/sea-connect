"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const countries = [
    "Tanzania",
    "Kenya",
    "Uganda",
    "Rwanda",
    "Burundi",
    "South Sudan",
    "Ethiopia",
    "Somalia",
    "Djibouti",
    "Eritrea",
    "Democratic Republic of the Congo",
    "Nigeria",
    "Ghana",
    "South Africa",
    "Zimbabwe",
    "Zambia",
    "Malawi",
    "Mozambique",
    "Other",
];

export default function ManageMemberPage() {
    const params = useParams();
    const router = useRouter();

    const memberId = params.id as string;

    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [position, setPosition] = useState("");
    const [bio, setBio] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadMember() {
            const { data, error } = await supabase
                .from("members")
                .select("*")
                .eq("id", memberId)
                .maybeSingle();

            if (error || !data) {
                setError(
                    error?.message || "Member could not be found."
                );
                setLoading(false);
                return;
            }

            setFullName(data.full_name || "");
            setCountry(data.country || "");
            setPosition(data.position || "");
            setBio(data.bio || "");

            setLoading(false);
        }

        loadMember();
    }, [memberId]);

    async function handleUpdate(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!fullName.trim() || !country || !position.trim()) {
            setError(
                "Please provide a name, country, and position."
            );
            return;
        }

        setSaving(true);

        const { error: updateError } = await supabase
            .from("members")
            .update({
                full_name: fullName.trim(),
                country,
                position: position.trim(),
                bio: bio.trim() || null,
            })
            .eq("id", memberId);

        setSaving(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setMessage("Member information updated successfully.");

        router.refresh();
    }

    async function handleRemove() {
        const confirmed = window.confirm(
            "Are you sure you want to remove this person from the active SEA member directory?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setRemoving(true);

        const { error: deleteError } = await supabase
            .from("members")
            .delete()
            .eq("id", memberId);

        setRemoving(false);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        router.push("/admin/members");
        router.refresh();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 text-[#0C2340]">
                <p className="text-sm text-gray-500">
                    Loading member...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 pb-10 text-[#0C2340]">

            {/* Header */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="h-1 bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-7 pt-8">

                    <Link
                        href="/admin/members"
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to Active Members
                    </Link>

                    <p className="mt-5 text-sm text-[#F4C430]">
                        Administration
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Manage Member
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Update or remove this active SEA member.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <form
                    onSubmit={handleUpdate}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                >

                    {/* Full Name */}
                    <div>

                        <label
                            htmlFor="fullName"
                            className="text-sm font-semibold"
                        >
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Country */}
                    <div className="mt-5">

                        <label
                            htmlFor="country"
                            className="text-sm font-semibold"
                        >
                            Country
                        </label>

                        <select
                            id="country"
                            value={country}
                            onChange={(event) =>
                                setCountry(event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#F15A24]"
                        >

                            <option value="">
                                Select country
                            </option>

                            {countries.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Position */}
                    <div className="mt-5">

                        <label
                            htmlFor="position"
                            className="text-sm font-semibold"
                        >
                            Position
                        </label>

                        <input
                            id="position"
                            type="text"
                            value={position}
                            onChange={(event) =>
                                setPosition(event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Bio */}
                    <div className="mt-5">

                        <label
                            htmlFor="bio"
                            className="text-sm font-semibold"
                        >
                            Bio <span className="font-normal text-gray-400">(optional)</span>
                        </label>

                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(event) =>
                                setBio(event.target.value)
                            }
                            rows={5}
                            placeholder="Tell us a little about this member..."
                            className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                        />

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {message && (
                        <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    {/* Save */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-6 w-full rounded-xl bg-[#16803A] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving
                            ? "Saving Changes..."
                            : "Save Changes"}
                    </button>

                </form>


                {/* Remove */}
                <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                    <h2 className="font-bold text-red-600">
                        Remove Active Member
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        This removes the person from the official
                        SEA member directory. It does not delete
                        their SEAConnect account.
                    </p>

                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={removing}
                        className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {removing
                            ? "Removing..."
                            : "Remove from Active Members"}
                    </button>

                </section>

            </div>

        </main>
    );
}