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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        const { error: signInError } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        setLoading(false);

        if (signInError) {
            setError(signInError.message);
            return;
        }

        router.push("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#071522] px-5 py-8 text-white">

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">

                {/* Header */}
                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16803A] text-xl font-bold shadow-lg">
                        SEA
                    </div>

                    <div className="mt-4 flex justify-center gap-2 text-lg">
                        <span>🇹🇿</span>
                        <span>🇰🇪</span>
                        <span>🇺🇬</span>
                        <span>🇪🇹</span>
                        <span>🇸🇴</span>
                        <span>🇷🇼</span>
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-[#F4C430]">
                        Students of East Africa
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Sign in to your SEAConnect account
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
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
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

                            <button
                                type="button"
                                className="text-xs font-semibold text-[#16803A] transition hover:text-[#0C2340]"
                            >
                                Forgot password?
                            </button>

                        </div>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                        />

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-[#16803A] px-4 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#126B31] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                </form>

                {/* Sign Up */}
                <p className="mt-6 text-center text-sm text-gray-400">

                    Don't have an account?{" "}

                    <Link
                        href="/signup"
                        className="font-semibold text-[#F4C430] transition hover:text-white"
                    >
                        Create an account
                    </Link>

                </p>

                {/* Footer */}
                <div className="mt-auto pt-8 text-center text-xs text-gray-500">
                    Students of East Africa • UTSA
                </div>

            </div>

        </main>
    );
}