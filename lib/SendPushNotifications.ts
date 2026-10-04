import webpush from "web-push";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

type PushSubscription = {
    endpoint: string;
    p256dh: string;
    auth: string;
};

export async function sendPushNotification(
    subscription: PushSubscription,
    title: string,
    body: string,
    url = "/notifications"
) {
    const payload = JSON.stringify({
        title,
        body,
        url,
    });

    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                },
            },
            payload
        );

        return {
            success: true,
        };
    } catch (error: any) {
        console.error(
            "Push notification failed:",
            error
        );

        return {
            success: false,
            statusCode: error?.statusCode,
            error,
        };
    }
}