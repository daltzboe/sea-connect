"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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

export default function SignUp() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setMessage("");

        const cleanName = fullName.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (
            !cleanName ||
            !country ||
            !cleanEmail ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (cleanName.length < 2) {
            setError("Please enter your full name.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        const { data, error: signUpError } =
            await supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: {
                    data: {
                        full_name: cleanName,
                        country,
                    },
                },
            });

        if (signUpError) {
            setLoading(false);

            if (
                signUpError.message
                    .toLowerCase()
                    .includes("already registered")
            ) {
                setError(
                    "An account with this email already exists. Please sign in instead."
                );
            } else {
                setError(signUpError.message);
            }

            return;
        }

        setLoading(false);

        if (data.user && !data.session) {
            setMessage(
                "Account created! Check your email to confirm your account before signing in."
            );

            return;
        }

        router.replace("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#071522] px-5 py-8 text-white">

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">

                {/* Back */}
                <div>
                    <Link
                        href="/"
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← Back
                    </Link>
                </div>

                {/* Header */}
                <div className="mt-8 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16803A] text-xl font-bold shadow-lg">
                        SEA
                    </div>

                    <div className="mt-5 flex flex-wrap justify-center gap-2 text-lg">
                        <span>🇹🇿</span>
                        <span>🇰🇪</span>
                        <span>🇺🇬</span>
                        <span>🇪🇹</span>
                        <span>🇸🇴</span>
                        <span>🇸🇸</span>
                        <span>🇪🇷</span>
                        <span>🇷🇼</span>
                        <span>🇧🇮</span>
                        <span>🇨🇩</span>
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#F4C430]">
                        SEAConnect
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Join SEAConnect
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-300">
                        Create your account and connect with
                        Students of East Africa at UTSA.
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 rounded-3xl bg-white p-6 text-[#0C2340] shadow-2xl"
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
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(event.target.value)
                            }
                            placeholder="Enter your full name"
                            required
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
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
                            name="country"
                            value={country}
                            onChange={(event) =>
                                setCountry(event.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
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

                    {/* Email */}
                    <div className="mt-5">

                        <label
                            htmlFor="email"
                            className="text-sm font-semibold"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            required
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                        />

                    </div>

                    {/* Password */}
                    <div className="mt-5">

                        <label
                            htmlFor="password"
                            className="text-sm font-semibold"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Create a password"
                            required
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                        />

                        <p className="mt-2 text-xs text-gray-400">
                            At least 8 characters.
                        </p>

                    </div>

                    {/* Confirm Password */}
                    <div className="mt-5">

                        <label
                            htmlFor="confirmPassword"
                            className="text-sm font-semibold"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Confirm your password"
                            required
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                        />

                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600"
                        >
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {message && (
                        <div
                            role="status"
                            className="mt-5 rounded-xl border border-[#16803A]/20 bg-[#16803A]/10 px-4 py-4 text-sm leading-5 text-[#16803A]"
                        >
                            <div className="flex gap-3">

                                <span className="text-lg">
                                    ✓
                                </span>

                                <p>{message}</p>

                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-[#16803A] px-4 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#126B31] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                    {/* Account note */}
                    <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-center">
                        <p className="text-xs leading-5 text-gray-500">
                            By creating an account, you'll be
                            able to access SEA events, meetings,
                            announcements, and community features.
                        </p>
                    </div>

                </form>

                {/* Sign In */}
                <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center">

                    <p className="text-sm text-gray-400">
                        Already have an account?
                    </p>

                    <Link
                        href="/signin"
                        className="mt-1 inline-block font-semibold text-[#F4C430] transition hover:text-white"
                    >
                        Sign in →
                    </Link>

                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 text-center text-xs text-gray-500">
                    Students of East Africa • UTSA
                </div>

            </div>

        </main>
    );
}