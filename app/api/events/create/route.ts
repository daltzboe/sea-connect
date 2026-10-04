import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendPushNotification } from "@/lib/push";

export async function POST(request: Request) {
    try {
        const { user, profile } = await getCurrentProfile();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (profile?.role !== "officer") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await request.json();

        const {
            title,
            description,
            eventDate,
            eventTime,
            location,
        } = body;

        if (!title || !eventDate || !eventTime || !location) {
            return NextResponse.json(
                { error: "Missing required event information." },
                { status: 400 }
            );
        }

        const supabase =
            await createSupabaseServerClient();

        // Create the event
        const { data: event, error: eventError } =
            await supabase
                .from("events")
                .insert({
                    title,
                    description,
                    event_date: eventDate,
                    event_time: eventTime,
                    location,
                })
                .select()
                .single();

        if (eventError) {
            console.error(
                "Could not create event:",
                eventError.message
            );

            return NextResponse.json(
                { error: eventError.message },
                { status: 500 }
            );
        }

        // Get users who have push notifications enabled
        const {
            data: subscriptions,
            error: subscriptionError,
        } = await supabase
            .from("push_subscriptions")
            .select("user_id")
            .neq("user_id", user.id);

        if (subscriptionError) {
            console.error(
                "Could not load push subscriptions:",
                subscriptionError.message
            );
        }

        const userIds = [
            ...new Set(
                (subscriptions ?? []).map(
                    (subscription) =>
                        subscription.user_id
                )
            ),
        ];

        // Create in-app notifications
        if (userIds.length > 0) {
            const notifications = userIds.map(
                (userId) => ({
                    user_id: userId,
                    title: "New Event",
                    message: title,
                    type: "event",
                    link: `/events/${event.id}`,
                    is_read: false,
                })
            );

            const {
                error: notificationError,
            } = await supabase
                .from("notifications")
                .insert(notifications);

            if (notificationError) {
                console.error(
                    "Could not create notifications:",
                    notificationError.message
                );
            }
        }

        // Send push notifications
        for (const userId of userIds) {
            await sendPushNotification(userId, {
                title: "New SEAConnect Event",
                body: title,
                url: `/events/${event.id}`,
            });
        }

        return NextResponse.json({
            success: true,
            event,
        });
    } catch (error) {
        console.error(
            "Create event error:",
            error
        );

        return NextResponse.json(
            {
                error: "Something went wrong while creating the event.",
            },
            { status: 500 }
        );
    }
}