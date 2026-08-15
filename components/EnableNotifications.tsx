"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat(
        (4 - (base64String.length % 4)) % 4
    );

    const base64 = (
        base64String + padding
    )
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((char) => char.charCodeAt(0))
    );
}

export default function EnableNotifications() {
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [error, setError] = useState("");

    async function enableNotifications() {
        setLoading(true);
        setError("");

        try {
            if (!("Notification" in window)) {
                throw new Error(
                    "Notifications are not supported on this device."
                );
            }

            if (!("serviceWorker" in navigator)) {
                throw new Error(
                    "Push notifications are not supported on this device."
                );
            }

            const permission =
                await Notification.requestPermission();

            if (permission !== "granted") {
                throw new Error(
                    "Notification permission was not granted."
                );
            }

            const registration =
                await navigator.serviceWorker.register("/sw.js");

            await navigator.serviceWorker.ready;

            const supabase =
                createSupabaseBrowserClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error(
                    "You must be signed in to enable notifications."
                );
            }

            const publicKey =
                process.env
                    .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!publicKey) {
                throw new Error(
                    "VAPID public key is missing."
                );
            }

            let subscription =
                await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription =
                    await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey:
                            urlBase64ToUint8Array(
                                publicKey
                            ),
                    });
            }

            const subscriptionJson =
                subscription.toJSON();

            const endpoint =
                subscriptionJson.endpoint;

            const p256dh =
                subscriptionJson.keys?.p256dh;

            const auth =
                subscriptionJson.keys?.auth;

            if (!endpoint || !p256dh || !auth) {
                throw new Error(
                    "Could not create a valid push subscription."
                );
            }

            const { error: saveError } =
                await supabase
                    .from("push_subscriptions")
                    .upsert(
                        {
                            user_id: user.id,
                            endpoint,
                            p256dh,
                            auth,
                        },
                        {
                            onConflict:
                                "user_id,endpoint",
                        }
                    );

            if (saveError) {
                throw new Error(
                    saveError.message
                );
            }

            setEnabled(true);
        } catch (err) {
            console.error(
                "Notification setup error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Could not enable notifications."
            );
        } finally {
            setLoading(false);
        }
    }

    if (enabled) {
        return (
            <div className="rounded-2xl bg-green-50 p-4">
                <p className="font-semibold text-green-700">
                    🔔 Notifications enabled
                </p>

                <p className="mt-1 text-sm text-green-600">
                    SEAConnect can now send you notifications.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="font-bold text-[#0C2340]">
                Stay Updated
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
                Allow SEAConnect to send you notifications
                about events, meetings, and announcements.
            </p>

            <button
                onClick={enableNotifications}
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-[#F15A24] px-4 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
                {loading
                    ? "Enabling..."
                    : "🔔 Enable Notifications"}
            </button>

            {error && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
}