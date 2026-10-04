"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function EnableNotifications() {
    const [supported, setSupported] = useState(true);
    const [permission, setPermission] =
        useState<NotificationPermission>("default");

    useEffect(() => {
        if (
            !("Notification" in window) ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in window)
        ) {
            setSupported(false);
            return;
        }

        setPermission(Notification.permission);
    }, []);

    async function enableNotifications() {
        if (!supported) {
            return;
        }

        try {
            // Ask the user for notification permission
            const result = await Notification.requestPermission();

            setPermission(result);

            if (result !== "granted") {
                console.log(
                    "Notification permission was not granted."
                );
                return;
            }

            // Get the active service worker
            const registration =
                await navigator.serviceWorker.ready;

            console.log(
                "Service worker ready:",
                registration
            );

            // Check for an existing subscription
            let subscription =
                await registration.pushManager.getSubscription();

            // Create a subscription if one doesn't exist
            if (!subscription) {
                const vapidPublicKey =
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

                if (!vapidPublicKey) {
                    throw new Error(
                        "VAPID public key is missing."
                    );
                }

                subscription =
                    await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: vapidPublicKey,
                    });
            }

            console.log(
                "SEAConnect Push Subscription:",
                subscription
            );

            // Get the subscription information
            const subscriptionJSON =
                subscription.toJSON();

            if (
                !subscriptionJSON.endpoint ||
                !subscriptionJSON.keys?.p256dh ||
                !subscriptionJSON.keys?.auth
            ) {
                throw new Error(
                    "Invalid push subscription."
                );
            }

            // Create Supabase client
            const supabase =
                createSupabaseBrowserClient();

            // Get currently logged-in user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                throw new Error(
                    "You must be signed in to enable notifications."
                );
            }

            // Save subscription to Supabase
            const { error: saveError } =
                await supabase
                    .from("push_subscriptions")
                    .upsert(
                        {
                            user_id: user.id,
                            endpoint:
                            subscriptionJSON.endpoint,
                            p256dh:
                            subscriptionJSON.keys.p256dh,
                            auth:
                            subscriptionJSON.keys.auth,
                        },
                        {
                            onConflict:
                                "user_id,endpoint",
                        }
                    );

            if (saveError) {
                throw saveError;
            }

            console.log(
                "Push subscription saved to Supabase."
            );

            alert(
                "SEAConnect notifications are enabled!"
            );
        } catch (error) {
            console.error(
                "Failed to enable notifications:",
                error
            );

            alert(
                "Unable to enable notifications. Check the browser console."
            );
        }
    }

    if (!supported) {
        return (
            <p className="text-sm text-gray-500">
                Push notifications are not supported on this device.
            </p>
        );
    }

    if (permission === "granted") {
        return (
            <button
                type="button"
                disabled
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
            >
                Notifications Enabled ✓
            </button>
        );
    }

    if (permission === "denied") {
        return (
            <p className="text-sm text-red-500">
                Notifications are blocked. Please enable them in
                your browser settings.
            </p>
        );
    }

    return (
        <button
            type="button"
            onClick={enableNotifications}
            className="rounded-lg bg-[#F15A24] px-4 py-2 font-medium text-white"
        >
            Enable Notifications
        </button>
    );
}