"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function EnableNotifications() {
    const [supported, setSupported] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function checkNotifications() {
            try {
                if (
                    typeof window === "undefined" ||
                    !("Notification" in window) ||
                    !("serviceWorker" in navigator) ||
                    !("PushManager" in window)
                ) {
                    setSupported(false);
                    setLoading(false);
                    return;
                }

                const supabase = createSupabaseBrowserClient();

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    setLoading(false);
                    return;
                }

                const registration =
                    await navigator.serviceWorker.ready;

                const subscription =
                    await registration.pushManager.getSubscription();

                if (subscription) {
                    setEnabled(true);
                    setLoading(false);
                    return;
                }

                const { data, error: subscriptionError } =
                    await supabase
                        .from("push_subscriptions")
                        .select("id")
                        .eq("user_id", user.id)
                        .limit(1);

                if (subscriptionError) {
                    console.error(
                        "Could not check notification subscription:",
                        subscriptionError.message
                    );
                }

                if (data && data.length > 0) {
                    setEnabled(true);
                }
            } catch (err) {
                console.error(
                    "Notification check failed:",
                    err
                );
            } finally {
                setLoading(false);
            }
        }

        checkNotifications();
    }, []);

    async function enableNotifications() {
        setError("");
        setSaving(true);

        try {
            if (
                !("Notification" in window) ||
                !("serviceWorker" in navigator) ||
                !("PushManager" in window)
            ) {
                setSupported(false);
                return;
            }

            const permission =
                await Notification.requestPermission();

            if (permission !== "granted") {
                setError(
                    "Notifications were not enabled. Please allow notifications in your browser settings."
                );
                return;
            }

            const registration =
                await navigator.serviceWorker.ready;

            const existingSubscription =
                await registration.pushManager.getSubscription();

            if (existingSubscription) {
                setEnabled(true);
                return;
            }

            const response = await fetch(
                "/api/push/public-key"
            );

            if (!response.ok) {
                throw new Error(
                    "Could not get notification settings."
                );
            }

            const { publicKey } =
                await response.json();

            const subscription =
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(
                        publicKey
                    ),
                });

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

            const subscriptionJSON =
                subscription.toJSON();

            const { error: saveError } =
                await supabase
                    .from("push_subscriptions")
                    .upsert(
                        {
                            user_id: user.id,
                            endpoint:
                            subscription.endpoint,
                            p256dh:
                            subscriptionJSON.keys?.p256dh,
                            auth:
                            subscriptionJSON.keys?.auth,
                        },
                        {
                            onConflict: "endpoint",
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
                "Notification setup failed:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Could not enable notifications."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading || !supported) {
        return null;
    }

    if (enabled) {
        return (
            <div className="rounded-2xl border border-[#16803A]/20 bg-[#16803A]/10 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16803A] text-xl">
                        🔔
                    </div>

                    <div>
                        <h3 className="font-bold text-[#0C2340]">
                            Notifications Enabled
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            You'll receive updates about
                            events, meetings, and announcements.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F4C430]/20 text-2xl">
                    🔔
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-[#0C2340]">
                        Stay Updated
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                        Allow SEAConnect to send you
                        notifications about events, meetings,
                        and announcements.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <button
                onClick={enableNotifications}
                disabled={saving}
                className="mt-4 w-full rounded-xl bg-[#16803A] px-4 py-3 font-bold text-white transition hover:bg-[#126B31] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {saving
                    ? "Enabling Notifications..."
                    : "🔔 Enable Notifications"}
            </button>
        </div>
    );
}

function urlBase64ToUint8Array(
    base64String: string
) {
    const padding =
        "=".repeat(
            (4 - (base64String.length % 4)) % 4
        );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((char) =>
            char.charCodeAt(0)
        )
    );
}