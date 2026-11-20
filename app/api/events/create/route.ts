
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendPushNotification } from "@/lib/push";

export async function POST(request: Request) {
    let supabase:
        | Awaited<ReturnType<typeof createSupabaseServerClient>>
        | null = null;

    let uploadedImagePath: string | null = null;
    let eventCreated = false;

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

        const formData = await request.formData();

        const title = formData.get("title");
        const description = formData.get("description");
        const eventDate = formData.get("eventDate");
        const eventTime = formData.get("eventTime");
        const location = formData.get("location");
        const image = formData.get("image");

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof eventDate !== "string" ||
            !eventDate ||
            typeof eventTime !== "string" ||
            !eventTime ||
            typeof location !== "string" ||
            !location.trim() ||
            (description !== null &&
                typeof description !== "string")
        ) {
            return NextResponse.json(
                { error: "Missing or invalid event information." },
                { status: 400 }
            );
        }

        const allowedTypes: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        };

        if (
            image !== null &&
            !(image instanceof File)
        ) {
            return NextResponse.json(
                { error: "Invalid image upload." },
                { status: 400 }
            );
        }

        if (image instanceof File) {
            if (image.size === 0 || image.size > 5 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "Image must be 5 MB or smaller." },
                    { status: 400 }
                );
            }

            if (!allowedTypes[image.type]) {
                return NextResponse.json(
                    { error: "Use a JPG, PNG, or WebP image." },
                    { status: 400 }
                );
            }
        }

        supabase = await createSupabaseServerClient();

        // Upload the optional event photo.
        if (image instanceof File) {
            const extension = allowedTypes[image.type];

            uploadedImagePath =
                `${user.id}/${crypto.randomUUID()}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from("event-images")
                .upload(uploadedImagePath, image, {
                    contentType: image.type,
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                console.error(
                    "Event image upload failed:",
                    uploadError.message
                );

                return NextResponse.json(
                    {
                        error:
                            "Could not upload event image. Check Supabase Storage permissions.",
                    },
                    { status: 500 }
                );
            }
        }

        // Create the event with its optional image path.
        const { data: event, error: eventError } = await supabase
            .from("events")
            .insert({
                school_id: profile.primary_school_id,
                title: title.trim(),
                description:
                    typeof description === "string"
                        ? description
                        : "",
                event_date: eventDate,
                event_time: eventTime,
                location: location.trim(),
                image_url: uploadedImagePath,
            })
            .select()
            .single();

        if (eventError) {
            console.error(
                "Could not create event:",
                eventError.message
            );

            if (uploadedImagePath) {
                await supabase.storage
                    .from("event-images")
                    .remove([uploadedImagePath]);
                uploadedImagePath = null;
            }

            return NextResponse.json(
                { error: eventError.message },
                { status: 500 }
            );
        }

        eventCreated = true;

        // Find active members of this campus who have push subscriptions.
        const { data: campusMemberships, error: membershipError } = await supabase
            .from("school_memberships")
            .select("user_id")
            .eq("school_id", event.school_id)
            .eq("status", "active");

        if (membershipError) {
            console.error("Could not load campus memberships:", membershipError.message);
        }

        const campusUserIds = (campusMemberships ?? [])
            .map((membership) => membership.user_id)
            .filter((userId) => userId !== user.id);

        const userIds = campusUserIds;

        // Send push notifications without failing event creation.
        for (const userId of userIds) {
            try {
                await sendPushNotification(userId, {
                    title: "New SEAConnect Event",
                    body: title.trim(),
                    url: `/events/${event.id}`,
                });
            } catch (pushError) {
                console.error(
                    "Could not send push notification:",
                    pushError
                );
            }
        }

        return NextResponse.json({
            success: true,
            event,
        });
    } catch (error) {
        console.error("Create event error:", error);

        // Only remove the image if event creation did not succeed.
        if (supabase && uploadedImagePath && !eventCreated) {
            try {
                await supabase.storage
                    .from("event-images")
                    .remove([uploadedImagePath]);
            } catch (cleanupError) {
                console.error(
                    "Image cleanup failed:",
                    cleanupError
                );
            }
        }

        return NextResponse.json(
            {
                error:
                    "Something went wrong while creating the event.",
            },
            { status: 500 }
        );
    }
}