"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExitCampusAdminButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function exitCampus() {
        setLoading(true);
        const response = await fetch("/api/admin/act-as", { method: "DELETE" });
        if (response.ok) {
            router.push("/admin/schools");
            router.refresh();
            return;
        }
        setLoading(false);
    }

    return (
        <button
            type="button"
            onClick={exitCampus}
            disabled={loading}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
        >
            {loading ? "Returning..." : "Exit campus view"}
        </button>
    );
}
