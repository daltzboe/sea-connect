"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteMyAccountButton() {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function deleteAccount() {
        if (confirmation !== "DELETE" || loading) return;
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/account/delete", { method: "POST" });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not delete your account.");
            router.replace("/signin?accountDeleted=1");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not delete your account.");
            setLoading(false);
        }
    }

    if (!confirming) {
        return (
            <button type="button" onClick={() => setConfirming(true)}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100">
                Delete my account
            </button>
        );
    }

    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
                This permanently deletes your account, profile, and sign-in access.
            </p>
            <label htmlFor="delete-account-confirmation" className="mt-3 block text-xs font-semibold text-red-800">
                Type DELETE to confirm
            </label>
            <input id="delete-account-confirmation" value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)} autoComplete="off"
                className="mt-2 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-[#0C2340] outline-none focus:border-red-500" />
            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
            <div className="mt-4 flex gap-3">
                <button type="button" disabled={loading}
                    onClick={() => { setConfirming(false); setConfirmation(""); setError(""); }}
                    className="flex-1 rounded-lg bg-white px-3 py-3 text-sm font-semibold text-[#0C2340] disabled:opacity-50">
                    Cancel
                </button>
                <button type="button" disabled={confirmation !== "DELETE" || loading} onClick={deleteAccount}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? "Deleting..." : "Permanently delete"}
                </button>
            </div>
        </div>
    );
}
