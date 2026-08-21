"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function checkSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                setError(
                    "This password reset link is invalid or has expired."
                );
            }

            setChecking(false);
        }

        checkSession();
    }, []);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!password || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Your password must be at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        const { error: updateError } =
            await supabase.auth.updateUser({
                password,
            });

        setLoading(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setSuccess(true);

        setTimeout(() => {
            router.replace("/dashboard");
        }, 1500);
    }

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#071522] text-white">
                <p className="text-sm text-gray-300">
                    Verifying reset link...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#071522] px-5 py-8 text-white">

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">

                <div>
                    <Link
                        href="/signin"
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← Back to Sign In
                    </Link>
                </div>

                <div className="mt-10 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16803A] text-xl font-bold shadow-lg">
                        SEA
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#F4C430]">
                        SEAConnect
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Create a new password
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Choose a new password for your account.
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 rounded-3xl bg-white p-6 text-[#0C2340] shadow-2xl"
                >

                    {success ? (
                        <div className="py-5 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                                ✓
                            </div>

                            <h2 className="mt-4 text-xl font-bold">
                                Password updated
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Taking you to your dashboard...
                            </p>

                        </div>
                    ) : error && !password ? (
                        <div className="text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                                !
                            </div>

                            <h2 className="mt-4 text-xl font-bold">
                                Reset link unavailable
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {error}
                            </p>

                            <Link
                                href="/forgot-password"
                                className="mt-6 block w-full rounded-xl bg-[#16803A] px-4 py-3.5 text-center font-semibold text-white"
                            >
                                Request a New Link
                            </Link>

                        </div>
                    ) : (
                        <>
                            <label
                                htmlFor="password"
                                className="text-sm font-semibold"
                            >
                                New Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter new password"
                                required
                                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                            />

                            <label
                                htmlFor="confirmPassword"
                                className="mt-5 block text-sm font-semibold"
                            >
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Confirm new password"
                                required
                                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                            />

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-6 w-full rounded-xl bg-[#16803A] px-4 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#126B31] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Updating Password..."
                                    : "Update Password"}
                            </button>

                            <p className="mt-4 text-center text-xs text-gray-400">
                                Password must be at least 6
                                characters.
                            </p>
                        </>
                    )}

                </form>

                <div className="mt-auto pt-8 text-center text-xs text-gray-500">
                    Students of East Africa • UTSA
                </div>

            </div>

        </main>
    );
}