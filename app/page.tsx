import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user is already logged in,
  // take them directly to the dashboard.
  if (user) {
    redirect("/dashboard");
  }

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
          <div className="mt-7 flex flex-wrap gap-2 text-xl">
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

          {/* Accent */}
          <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#16803A] via-[#F4C430] to-[#F15A24]" />

          {/* Hero */}
          <section className="flex flex-1 flex-col justify-center py-12">

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#F4C430]">
              UTSA
            </p>

            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Connect.
              <br />
              Belong.
              <br />
              <span className="text-[#16803A]">
              Grow.
            </span>
            </h2>

            <p className="mt-6 text-lg leading-7 text-gray-300">
              Your home for Students of East Africa at UTSA.
              Stay connected with events, meetings,
              announcements, and your community.
            </p>

          </section>

          {/* Buttons */}
          <section className="space-y-3">

            <Link
                href="/signin"
                className="block w-full rounded-2xl bg-[#16803A] px-6 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:bg-[#126B31] active:scale-[0.98]"
            >
              Sign In
            </Link>

            <Link
                href="/signup"
                className="block w-full rounded-2xl border-2 border-[#F4C430]/70 bg-transparent px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-[#F4C430]/10 active:scale-[0.98]"
            >
              Create Account
            </Link>

          </section>

          {/* Footer */}
          <footer className="pt-8 text-center text-sm text-gray-400">

            <p>
              Students of East Africa • UTSA
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
              <span>🇹🇿</span>
              <span>🇰🇪</span>
              <span>🇺🇬</span>
              <span>🇪🇹</span>
              <span>🇸🇴</span>
              <span>🇸🇸</span>
              <span>🇪🇷</span>
              <span>🇳🇬</span>
              <span>🇨🇬</span>
              <span>🇧🇮</span>
              <span>🇷🇼</span>
              <span>🇨🇩</span>
            </div>

            <p className="mt-3">
              Developed by Dalton Opudo • 2026
            </p>

          </footer>

        </div>

      </main>
  );
}