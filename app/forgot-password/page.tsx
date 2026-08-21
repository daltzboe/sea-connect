"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess(false);

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        const { error: resetError } =
            await supabase.auth.resetPasswordForEmail(
                cleanEmail,
                {
                    redirectTo: `${window.location.origin}/reset-password`,
                }
            );

        setLoading(false);

        if (resetError) {
            setError(resetError.message);
            return;
        }

        setSuccess(true);
    }

    return (
        <main className="min-h-screen bg-[#071522] px-5 py-8 text-white">

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">

                {/* Back */}
                <div>
                    <Link
                        href="/signin"
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← Back to Sign In
                    </Link>
                </div>

                {/* Header */}
                <div className="mt-10 text-center">

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
                        Forgot your password?
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-300">
                        Enter your email and we'll send you a
                        secure link to reset your password.
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 rounded-3xl bg-white p-6 text-[#0C2340] shadow-2xl"
                >

                    {!success ? (
                        <>
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
                                    ? "Sending Reset Link..."
                                    : "Send Reset Link"}
                            </button>
                        </>
                    ) : (
                        <div className="text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                                ✓
                            </div>

                            <h2 className="mt-4 text-xl font-bold">
                                Check your email
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                If an account exists for{" "}
                                <span className="font-semibold text-[#0C2340]">
                                    {email}
                                </span>
                                , we've sent a password reset link.
                            </p>

                            <p className="mt-3 text-xs leading-5 text-gray-400">
                                Don't see it? Check your spam or
                                junk folder.
                            </p>

                            <Link
                                href="/signin"
                                className="mt-6 block w-full rounded-xl bg-[#0C2340] px-4 py-3.5 text-center font-semibold text-white transition hover:opacity-90"
                            >
                                Back to Sign In
                            </Link>

                        </div>
                    )}

                </form>

                {/* Footer */}
                <div className="mt-auto pt-8 text-center text-xs text-gray-500">
                    Students of East Africa • UTSA
                </div>

            </div>

        </main>
    );
}