"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type RsvpStatus = "going" | "maybe" | null;

type EventRsvpProps = {
    eventId: string;
    initialStatus: RsvpStatus;
    initialGoingCount: number;
    initialMaybeCount: number;
};

export default function EventRsvp({
    eventId,
    initialStatus,
    initialGoingCount,
    initialMaybeCount,
}: EventRsvpProps) {
    const [status, setStatus] = useState<RsvpStatus>(initialStatus);
    const [goingCount, setGoingCount] = useState(initialGoingCount);
    const [maybeCount, setMaybeCount] = useState(initialMaybeCount);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function saveRsvp(nextStatus: Exclude<RsvpStatus, null>) {
        if (loading || status === nextStatus) return;

        setLoading(true);
        setError("");

        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error("Your session has expired. Please sign in again.");
            }

            const { error: saveError } = await supabase
                .from("event_rsvps")
                .upsert(
                    {
                        event_id: eventId,
                        user_id: user.id,
                        status: nextStatus,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "event_id,user_id" }
                );

            if (saveError) throw saveError;

            if (status === "going") setGoingCount((count) => Math.max(0, count - 1));
            if (status === "maybe") setMaybeCount((count) => Math.max(0, count - 1));
            if (nextStatus === "going") setGoingCount((count) => count + 1);
            if (nextStatus === "maybe") setMaybeCount((count) => count + 1);

            setStatus(nextStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save your RSVP.");
        } finally {
            setLoading(false);
        }
    }

    async function cancelRsvp() {
        if (loading || !status) return;

        setLoading(true);
        setError("");

        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error("Your session has expired. Please sign in again.");
            }

            const { error: deleteError } = await supabase
                .from("event_rsvps")
                .delete()
                .eq("event_id", eventId)
                .eq("user_id", user.id);

            if (deleteError) throw deleteError;

            if (status === "going") setGoingCount((count) => Math.max(0, count - 1));
            if (status === "maybe") setMaybeCount((count) => Math.max(0, count - 1));
            setStatus(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not cancel your RSVP.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#F15A24]">
                        Your attendance
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-[#0C2340]">
                        Are you joining us?
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Let the SEA community know if you plan to attend.
                    </p>
                </div>
                <span className="text-2xl" aria-hidden="true">🙌</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => saveRsvp("going")}
                    disabled={loading}
                    aria-pressed={status === "going"}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${status === "going" ? "border-[#F15A24] bg-[#F15A24] text-white" : "border-gray-200 bg-white text-[#0C2340] hover:border-[#F15A24]"}`}
                >
                    {status === "going" ? "✓ Going" : "I'm Going"}
                </button>
                <button
                    type="button"
                    onClick={() => saveRsvp("maybe")}
                    disabled={loading}
                    aria-pressed={status === "maybe"}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${status === "maybe" ? "border-[#0C2340] bg-[#0C2340] text-white" : "border-gray-200 bg-white text-[#0C2340] hover:border-[#0C2340]"}`}
                >
                    {status === "maybe" ? "✓ Maybe" : "Maybe"}
                </button>
            </div>

            {status && (
                <button
                    type="button"
                    onClick={cancelRsvp}
                    disabled={loading}
                    className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 underline underline-offset-4 hover:text-red-600 disabled:opacity-60"
                >
                    Cancel RSVP
                </button>
            )}

            {loading && (
                <p className="mt-3 text-center text-xs text-gray-500">Saving your response...</p>
            )}

            {error && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                <div className="rounded-xl bg-orange-50 p-3 text-center">
                    <p className="text-2xl font-bold text-[#F15A24]">{goingCount}</p>
                    <p className="mt-1 text-xs font-medium text-gray-600">Going</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold text-[#0C2340]">{maybeCount}</p>
                    <p className="mt-1 text-xs font-medium text-gray-600">Maybe</p>
                </div>
            </div>
        </section>
    );
}
