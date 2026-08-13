import Link from "next/link";

export default function Home() {
  return (
      <main className="min-h-screen bg-[#0C2340] text-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">

          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                SEA<span className="text-[#F15A24]">Connect</span>
              </h1>

              <p className="text-sm text-gray-300">
                Students of East Africa
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F15A24] text-sm font-bold">
              SEA
            </div>
          </header>

          {/* Hero */}
          <section className="flex flex-1 flex-col justify-center py-16">

            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#F15A24]">
              UTSA
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              Connect.
              <br />
              Belong.
              <br />
              <span className="text-[#F15A24]">Grow.</span>
            </h2>

            <p className="mt-6 text-lg leading-7 text-gray-300">
              Your home for Students of East Africa at UTSA. Stay connected
              with events, meetings, announcements, and your community.
            </p>

          </section>

          {/* Buttons */}
          <section className="space-y-4">

            <Link
                href="/signin"
                className="block w-full rounded-2xl bg-[#F15A24] px-6 py-4 text-center text-lg font-semibold transition hover:opacity-90"
            >
              Sign In
            </Link>

            <Link
                href="/signup"
                className="block w-full rounded-2xl border border-white/30 px-6 py-4 text-center text-lg font-semibold transition hover:bg-white/10"
            >
              Create Account
            </Link>

          </section>

          {/* Footer */}
          <footer className="pt-8 text-center text-sm text-gray-400">
            Students of East Africa • UTSA
          </footer>

        </div>
      </main>
  );
}