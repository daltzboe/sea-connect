"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const countries = [
    "Algeria",
    "Angola",
    "Benin",
    "Botswana",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cameroon",
    "Central African Republic",
    "Chad",
    "Comoros",
    "Democratic Republic of the Congo",
    "Djibouti",
    "Egypt",
    "Equatorial Guinea",
    "Eritrea",
    "Eswatini",
    "Ethiopia",
    "Gabon",
    "Gambia",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Ivory Coast",
    "Kenya",
    "Lesotho",
    "Liberia",
    "Libya",
    "Madagascar",
    "Malawi",
    "Mali",
    "Mauritania",
    "Mauritius",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Niger",
    "Nigeria",
    "Republic of the Congo",
    "Rwanda",
    "São Tomé and Príncipe",
    "Senegal",
    "Seychelles",
    "Sierra Leone",
    "Somalia",
    "Somaliland",
    "South Africa",
    "South Sudan",
    "Sudan",
    "Tanzania",
    "Togo",
    "Tunisia",
    "Uganda",
    "United States of America",
    "Zambia",
    "Zimbabwe",
];

export default function AddMemberPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [position, setPosition] = useState("");
    const [bio, setBio] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!fullName.trim() || !country || !position.trim()) {
            setError(
                "Please provide a name, country, and position."
            );
            return;
        }

        setLoading(true);

        const { error: insertError } = await supabase
            .from("members")
            .insert({
                full_name: fullName.trim(),
                country,
                position: position.trim(),
                bio: bio.trim() || null,
            });

        setLoading(false);

        if (insertError) {
            setError(insertError.message);
            return;
        }

        router.push("/admin/members");
        router.refresh();
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
                        Add Active Member
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Add someone to the official SEA member
                        directory.
                    </p>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                <form
                    onSubmit={handleSubmit}
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
                            placeholder="Enter full name"
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
                            placeholder="Example: Student, Engineer, Officer"
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Bio */}
                    <div className="mt-5">

                        <label
                            htmlFor="bio"
                            className="text-sm font-semibold"
                        >
                            Bio
                            <span className="ml-1 font-normal text-gray-400">
                                (optional)
                            </span>
                        </label>

                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(event) =>
                                setBio(event.target.value)
                            }
                            placeholder="Short description about the member"
                            rows={4}
                            className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-[#16803A] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Adding Member..."
                            : "Add Active Member"}
                    </button>

                </form>

            </div>

        </main>
    );
}