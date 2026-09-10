"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function Home() {
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setRedirecting(true);
        window.location.href = "/dashboard";
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, []);

  // Startup loading screen
  if (checking || redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071522] text-white">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#16803A] text-xl font-bold shadow-lg">
            SEA
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight">
            SEA<span className="text-[#F4C430]">Connect</span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Students of East Africa
          </p>

          <div className="mt-8 h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-[#F4C430]" />

          <p className="mt-4 text-sm text-gray-400">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  // Logged-out landing page
  return (
    <main className="min-h-screen bg-[#071522] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              SEA<span className="text-[#F4C430]">Connect</span>
            </h1>

            <p className="text-sm text-gray-300">
              Students of East Africa
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16803A] text-sm font-bold shadow-lg">
            SEA
          </div>
        </header>

        {/* Flags */}
        <div className="mt-8 flex justify-center gap-2 text-2xl">
          🇹🇿 🇰🇪 🇺🇬 🇷🇼 🇧🇮 🇪🇹 🇸🇴 🇳🇬
        </div>

        {/* Hero */}
        <section className="mt-10 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#16803A] text-2xl font-bold shadow-xl">
            SEA
          </div>

          <h2 className="mt-7 text-4xl font-extrabold tracking-tight">
            Welcome to{" "}
            <span className="text-[#F4C430]">SEAConnect</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-300">
            Your digital hub for Students of East Africa at UTSA.
          </p>

          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#F15A24]" />
        </section>

        {/* Features */}
        <section className="mt-10 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl">📅</div>

              <div>
                <h3 className="font-semibold">Stay Connected</h3>
                <p className="text-sm text-gray-400">
                  Keep up with SEA events and activities.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl">📢</div>

              <div>
                <h3 className="font-semibold">Latest News</h3>
                <p className="text-sm text-gray-400">
                  Get important announcements from SEA.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl">👥</div>

              <div>
                <h3 className="font-semibold">Meet the Community</h3>
                <p className="text-sm text-gray-400">
                  Connect with fellow East African students.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mt-10 space-y-3">
          <Link
            href="/signin"
            prefetch={true}
            className="flex w-full items-center justify-center rounded-2xl bg-[#16803A] px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-[#126b30] active:scale-[0.98]"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            prefetch={true}
            className="flex w-full items-center justify-center rounded-2xl border border-[#F4C430] px-6 py-4 font-semibold text-[#F4C430] transition hover:bg-[#F4C430]/10 active:scale-[0.98]"
          >
            Create Account
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-10 text-center">
          <p className="text-xs text-gray-500">
            Students of East Africa at UTSA
          </p>

          <p className="mt-1 text-xs text-gray-600">
            developed by Dalton Opudo @2026
          </p>
        </footer>
      </div>
    </main>
  );
}