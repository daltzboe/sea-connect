"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const AFRICAN_COUNTRIES = [
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

export default function EditProfile() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadProfile() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/signin");
                return;
            }

            setFullName(
                user.user_metadata?.full_name || ""
            );

            setCountry(
                user.user_metadata?.country || ""
            );

            setLoading(false);
        }

        loadProfile();
    }, [router]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!country) {
            setError("Please select your country.");
            return;
        }

        setSaving(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setError("Your session has expired. Please sign in again.");
            setSaving(false);
            return;
        }

// Update Supabase Auth metadata
        const { error: authError } =
            await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim(),
                    country,
                },
            });

        if (authError) {
            setError(authError.message);
            setSaving(false);
            return;
        }

// Update the profiles table
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                full_name: fullName.trim(),
                country: country,
            })
            .eq("id", user.id);

        if (profileError) {
            setError(profileError.message);
            setSaving(false);
            return;
        }

        setSuccess("Profile updated successfully.");

        setSaving(false);

        setTimeout(() => {
            router.push("/profile");
            router.refresh();
        }, 800);

        setSuccess("Profile updated successfully.");

        setSaving(false);

        setTimeout(() => {
            router.push("/profile");
            router.refresh();
        }, 800);
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F4F6F5] text-[#0C2340]">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#16803A]" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading your profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F4F6F5] text-[#0C2340]">

            {/* HEADER */}
            <header className="relative overflow-hidden bg-[#071522] text-white">

                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

                <div className="mx-auto max-w-md px-5 pb-8 pt-8">

                    <Link
                        href="/profile"
                        className="text-sm font-semibold text-gray-300 transition hover:text-white"
                    >
                        ← Profile
                    </Link>

                    <h1 className="mt-7 text-3xl font-bold">
                        Edit Profile
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        Keep your SEAConnect information up to date.
                    </p>

                </div>

            </header>

            {/* FORM */}
            <div className="mx-auto max-w-md px-5 py-6">

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl bg-white p-6 shadow-sm"
                >

                    {/* FULL NAME */}
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
                            placeholder="Enter your full name"
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                        />

                    </div>

                    {/* COUNTRY */}
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
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                        >

                            <option value="">
                                Select your country
                            </option>

                            {AFRICAN_COUNTRIES.map(
                                (countryName) => (
                                    <option
                                        key={countryName}
                                        value={countryName}
                                    >
                                        {countryName}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* EMAIL */}
                    <div className="mt-5">

                        <label
                            className="text-sm font-semibold"
                        >
                            Email Address
                        </label>

                        <div className="mt-2 rounded-xl bg-gray-100 px-4 py-3 text-gray-500">
                            {/* Email is intentionally read-only */}
                            Your account email cannot be changed here.
                        </div>

                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {/* SAVE */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-6 w-full rounded-xl bg-[#16803A] px-4 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#126B31] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving
                            ? "Saving Changes..."
                            : "Save Changes"}
                    </button>

                    {/* CANCEL */}
                    <Link
                        href="/profile"
                        className="mt-3 block w-full rounded-xl border border-gray-200 px-4 py-3 text-center font-semibold text-[#0C2340] transition hover:bg-gray-50"
                    >
                        Cancel
                    </Link>

                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    SEAConnect • Students of East Africa • UTSA
                </p>

            </div>

        </main>
    );
}