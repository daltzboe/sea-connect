import webpush from "web-push";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const vapidPublicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const vapidPrivateKey =
    process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error(
        "VAPID keys are missing from environment variables."
    );
}

webpush.setVapidDetails(
    "mailto:seaconnect@utsa.edu",
    vapidPublicKey,
    vapidPrivateKey
);

type PushPayload = {
    title: string;
    body: string;
    url?: string;
};

export async function sendPushNotification(
    userId: string,
    payload: PushPayload
) {
    // This server-only helper uses the service role to retrieve the target user's
    // subscription after the calling API route has authorized the recipient.
    const supabase = createSupabaseAdminClient();

    const { data: subscriptions, error } =
        await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", userId);

    if (error) {
        console.error(
            "Could not load push subscriptions:",
            error.message
        );

        return;
    }

    if (!subscriptions || subscriptions.length === 0) {
        return;
    }

    for (const subscription of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,

                    keys: {
                        p256dh: subscription.p256dh,
                        auth: subscription.auth,
                    },
                },
                JSON.stringify(payload)
            );
        } catch (error: any) {
            console.error(
                "Push notification failed:",
                error
            );

            // Subscription is no longer valid.
            if (
                error.statusCode === 404 ||
                error.statusCode === 410
            ) {
                await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq(
                        "id",
                        subscription.id
                    );
            }
        }
    }
}