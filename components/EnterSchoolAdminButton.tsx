"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnterSchoolAdminButton({ schoolId }: { schoolId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function enterCampus() {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/admin/act-as", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schoolId }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not open campus.");
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not open campus.");
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={enterCampus}
                disabled={loading}
                className="rounded-xl bg-[#F15A24] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
                {loading ? "Opening..." : "View school dashboard →"}
            </button>
            {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </div>
    );
}
