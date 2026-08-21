"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignIn() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        const cleanEmail = email.trim();

        if (!cleanEmail || !password) {
            setError(
                "Please enter your email and password."
            );
            return;
        }

        setLoading(true);

        const { error: signInError } =
            await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
            });

        if (signInError) {
            setLoading(false);

            if (
                signInError.message
                    .toLowerCase()
                    .includes("invalid login credentials")
            ) {
                setError(
                    "Incorrect email or password. Please try again."
                );
            } else {
                setError(signInError.message);
            }

            return;
        }

        // Supabase stores the session in the browser.
        // Returning users will remain signed in.
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
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-300">
                        Sign in to stay connected with the
                        Students of East Africa at UTSA.
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 rounded-3xl bg-white p-6 text-[#0C2340] shadow-2xl"
                >

                    {/* Email */}
                    <div>

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

                        <div className="flex items-center justify-between">

                            <label
                                htmlFor="password"
                                className="text-sm font-semibold"
                            >
                                Password
                            </label>

                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-[#16803A] transition hover:text-[#0C2340]"
                            >
                                Forgot password?
                            </Link>

                        </div>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-[#16803A] px-4 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#126B31] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In"}
                    </button>

                    {/* Session message */}
                    <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-center">
                        <p className="text-xs leading-5 text-gray-500">
                            You'll stay signed in on this device
                            until you log out.
                        </p>
                    </div>

                </form>

                {/* Sign Up */}
                <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center">

                    <p className="text-sm text-gray-400">
                        Don't have an account?
                    </p>

                    <Link
                        href="/signup"
                        className="mt-1 inline-block font-semibold text-[#F4C430] transition hover:text-white"
                    >
                        Create your SEAConnect account →
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