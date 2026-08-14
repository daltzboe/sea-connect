"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Notification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "@/lib/notifications";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);


    async function loadNotifications() {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();

        console.log("CURRENT USER:", user);
        console.log("CURRENT USER ID:", user?.id);

        const data = await getNotifications();

        setNotifications(data);
        setLoading(false);
    }

    useEffect(() => {
        loadNotifications();
    }, []);

    async function handleRead(id: string) {
        await markNotificationAsRead(id);

        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id
                    ? {
                        ...notification,
                        is_read: true,
                    }
                    : notification
            )
        );
    }

    async function handleMarkAllRead() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return;
        }

        await markAllNotificationsAsRead(user.id);

        setNotifications((current) =>
            current.map((notification) => ({
                ...notification,
                is_read: true,
            }))
        );
    }

    function getIcon(type: string) {
        switch (type) {
            case "event":
                return "📅";

            case "meeting":
                return "🤝";

            case "announcement":
                return "📢";

            default:
                return "🔔";
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    return (
        <main className="min-h-screen bg-gray-100 pb-24 text-[#0C2340]">

            {/* Header */}
            <header className="bg-[#0C2340] px-5 pb-7 pt-8 text-white">

                <div className="mx-auto max-w-md">

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-300 transition hover:text-white"
                    >
                        ← Back to Home
                    </Link>

                    <div className="mt-5 flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-300">
                                SEAConnect
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                Notifications
                            </h1>

                        </div>

                        {notifications.some(
                            (notification) =>
                                !notification.is_read
                        ) && (
                            <button
                                onClick={handleMarkAllRead}
                                className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                            >
                                Mark all read
                            </button>
                        )}

                    </div>

                </div>

            </header>

            <div className="mx-auto max-w-md px-5 py-6">

                {/* Loading */}
                {loading && (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

                        <p className="text-sm text-gray-500">
                            Loading notifications...
                        </p>

                    </div>
                )}

                {/* Empty */}
                {!loading && notifications.length === 0 && (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

                        <div className="text-4xl">
                            🔔
                        </div>

                        <h2 className="mt-4 text-lg font-bold">
                            No notifications
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            You're all caught up.
                        </p>

                    </div>
                )}

                {/* Notifications */}
                {!loading && notifications.length > 0 && (
                    <div className="space-y-3">

                        {notifications.map((notification) => (

                            <Link
                                key={notification.id}
                                href={notification.link || "/notifications"}
                                onClick={() =>
                                    handleRead(notification.id)
                                }
                                className={`block w-full rounded-2xl p-5 text-left shadow-sm transition hover:shadow-md ${
                                    notification.is_read
                                        ? "bg-white"
                                        : "border border-[#F15A24]/20 bg-[#FFF7F3]"
                                }`}
                            >

                                <div className="flex gap-4">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0C2340] text-lg">
                                        {getIcon(
                                            notification.type
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-start justify-between gap-3">

                                            <h2
                                                className={`font-semibold ${
                                                    notification.is_read
                                                        ? "text-[#0C2340]"
                                                        : "text-[#0C2340]"
                                                }`}
                                            >
                                                {notification.title}
                                            </h2>

                                            {!notification.is_read && (
                                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F15A24]" />
                                            )}

                                        </div>

                                        <p className="mt-1 text-sm leading-6 text-gray-600">
                                            {notification.message}
                                        </p>

                                        <p className="mt-2 text-xs text-gray-400">
                                            {formatDate(
                                                notification.created_at
                                            )}
                                        </p>
                                        {notification.link && (
                                            <p className="mt-3 text-xs font-semibold text-[#F15A24]">
                                                View {notification.type} →
                                            </p>
                                        )}

                                    </div>

                                </div>

                            </Link>

                        ))}

                    </div>
                )}

            </div>

        </main>
    );
}