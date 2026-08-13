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
    "South Africa",
    "South Sudan",
    "Sudan",
    "Tanzania",
    "Togo",
    "Tunisia",
    "Uganda",
    "Zambia",
    "Zimbabwe",
];

export default function SignUp() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setMessage("");

        if (
            !fullName ||
            !country ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        setLoading(true);

        const { data, error: signUpError } =
            await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        country: country,
                    },
                },
            });

        setLoading(false);

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        if (data.user && !data.session) {
            setMessage(
                "Account created! Check your email to confirm your account."
            );
            return;
        }

        router.push("/dashboard");
    }

    return (
        <main className="min-h-screen bg-gray-100 px-5 py-10 text-[#0C2340]">

            <div className="mx-auto max-w-md">

                {/* Logo */}
                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0C2340] text-2xl font-bold text-white">
                        SEA
                    </div>

                    <h1 className="mt-5 text-3xl font-bold">
                        Create your account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Join the Students of East Africa community
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
                >

                    {/* Full Name */}
                    <div>
                        <label
                            htmlFor="fullName"
                            className="text-sm font-medium"
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
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#F15A24]"
                        />
                    </div>

                    {/* Country */}
                    <div className="mt-5">

                        <label
                            htmlFor="country"
                            className="text-sm font-medium"
                        >
                            Country
                        </label>

                        <select
                            id="country"
                            value={country}
                            onChange={(event) =>
                                setCountry(event.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#16803A]"
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
                            className="text-sm font-medium"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                    </div>

                    {/* Password */}
                    <div className="mt-5">

                        <label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Create a password"
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#F15A24]"
                        />

                        <p className="mt-2 text-xs text-gray-400">
                            Must be at least 8 characters.
                        </p>

                    </div>

                    {/* Confirm Password */}
                    <div className="mt-5">

                        <label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="Confirm your password"
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#F15A24]"
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-[#F15A24] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                {/* Sign In */}
                <p className="mt-6 text-center text-sm text-gray-500">

                    Already have an account?{" "}

                    <Link
                        href="/signin"
                        className="font-semibold text-[#F15A24]"
                    >
                        Sign in
                    </Link>

                </p>

            </div>

        </main>
    );
}