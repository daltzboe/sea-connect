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

        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required." },
                { status: 400 }
            );
        }

        const supabase =
            await createSupabaseServerClient();

        // Create the announcement
        const {
            data: announcement,
            error: announcementError,
        } = await supabase
            .from("announcements")
            .insert({
                title,
                content,
            })
            .select()
            .single();

        if (announcementError) {
            console.error(
                "Could not create announcement:",
                announcementError.message
            );

            return NextResponse.json(
                { error: announcementError.message },
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
                    title: "New Announcement",
                    message: title,
                    type: "announcement",
                    link: `/announcements/${announcement.id}`,
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
                title: "New SEAConnect Announcement",
                body: title,
                url: `/announcements/${announcement.id}`,
            });
        }

        return NextResponse.json({
            success: true,
            announcement,
        });
    } catch (error) {
        console.error(
            "Create announcement error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Something went wrong while creating the announcement.",
            },
            { status: 500 }
        );
    }
}