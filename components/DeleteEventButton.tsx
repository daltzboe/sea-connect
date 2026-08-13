"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function DeleteEventButton({
                                              eventId,
                                          }: {
    eventId: string;
}) {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmed) {
            return;
        }

        setDeleting(true);

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);

        if (error) {
            alert(error.message);
            setDeleting(false);
            return;
        }

        router.refresh();
    }

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
            {deleting ? "Deleting..." : "Delete"}
        </button>
    );
}