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

        if (profile?.role !== "officer" || !profile.primary_school_id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await request.json();

        const {
            title,
            description,
            meetingDate,
            meetingTime,
            location,
        } = body;

        if (
            !title ||
            !meetingDate ||
            !meetingTime ||
            !location
        ) {
            return NextResponse.json(
                {
                    error:
                        "Missing required meeting information.",
                },
                { status: 400 }
            );
        }

        const supabase =
            await createSupabaseServerClient();

        const {
            data: meeting,
            error: meetingError,
        } = await supabase
            .from("meetings")
            .insert({
                title,
                description,
                meeting_date: meetingDate,
                meeting_time: meetingTime,
                location,
            })
            .select()
            .single();

        if (meetingError) {
            console.error(
                "Could not create meeting:",
                meetingError.message
            );

            return NextResponse.json(
                { error: meetingError.message },
                { status: 500 }
            );
        }

        // Get active members of this campus who have push notifications enabled.
        const { data: campusMemberships, error: membershipError } = await supabase
            .from("school_memberships")
            .select("user_id")
            .eq("school_id", profile.primary_school_id)
            .eq("status", "active");

        if (membershipError) {
            console.error("Could not load campus memberships:", membershipError.message);
        }

        const campusUserIds = (campusMemberships ?? [])
            .map((membership) => membership.user_id)
            .filter((userId) => userId !== user.id);

        const {
            data: subscriptions,
            error: subscriptionError,
        } = campusUserIds.length > 0
            ? await supabase
                .from("push_subscriptions")
                .select("user_id")
                .in("user_id", campusUserIds)
            : { data: [], error: null };

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

        // Send browser/device push notifications.
        for (const userId of userIds) {
            await sendPushNotification(userId, {
                title: "New SEAConnect Meeting",
                body: title,
                url: `/meetings/${meeting.id}`,
            });
        }

        return NextResponse.json({
            success: true,
            meeting,
        });
    } catch (error) {
        console.error(
            "Create meeting error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Something went wrong while creating the meeting.",
            },
            { status: 500 }
        );
    }
}