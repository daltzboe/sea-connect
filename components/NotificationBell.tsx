"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default function NotificationBell() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        async function loadCount() {
            const unreadCount =
                await getUnreadNotificationCount();

            setCount(unreadCount);
        }

        loadCount();

        const channel = supabase
            .channel("notification-bell")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                },
                () => {
                    loadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xl transition hover:bg-white/15"
        >
            🔔

            {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F15A24] px-1 text-[10px] font-bold text-white ring-2 ring-[#071522]">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}