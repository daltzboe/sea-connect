import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profile";
import { sendPushNotification } from "@/lib/push";

export async function POST() {
    const { user } = await getCurrentProfile();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    await sendPushNotification(user.id, {
        title: "SEAConnect",
        body: "🎉 Push notifications are working!",
        url: "/notifications",
    });

    return NextResponse.json({
        success: true,
    });
}