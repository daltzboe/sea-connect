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
        <main className="min-h-screen bg-gray-100 px-5 py-10 text-[#0C2340]">

            <div className="mx-auto max-w-md">

                {/* Logo */}
                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0C2340] text-2xl font-bold text-white">
                        SEA
                    </div>

                    <h1 className="mt-5 text-3xl font-bold">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to your SEAConnect account
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
                >

                    {/* Email */}
                    <div>

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

                        <div className="flex items-center justify-between">

                            <label
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </label>

                            <button
                                type="button"
                                className="text-xs font-medium text-[#F15A24]"
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
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#F15A24]"
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
                        className="mt-6 w-full rounded-xl bg-[#F15A24] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                </form>

                {/* Sign Up */}
                <p className="mt-6 text-center text-sm text-gray-500">

                    Don't have an account?{" "}

                    <Link
                        href="/signup"
                        className="font-semibold text-[#F15A24]"
                    >
                        Create an account
                    </Link>

                </p>

            </div>

        </main>
    );
}