
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendPushNotification } from "@/lib/push";

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();

        // Verify the signed-in user.
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { conversationId, messageId } =
            await request.json();

        if (!conversationId || !messageId) {
            return NextResponse.json(
                { error: "Missing conversation or message ID" },
                { status: 400 }
            );
        }

        // Confirm the message exists in this conversation
        // and was sent by the signed-in user.
        const { data: message, error: messageError } =
            await supabase
                .from("messages")
                .select("id, conversation_id, sender_id, content")
                .eq("id", messageId)
                .eq("conversation_id", conversationId)
                .eq("sender_id", user.id)
                .single();

        if (messageError || !message) {
            return NextResponse.json(
                { error: "Message not found or not authorized" },
                { status: 403 }
            );
        }

        // Confirm the sender belongs to this conversation.
        const { data: senderMembership, error: senderError } =
            await supabase
                .from("conversation_members")
                .select("user_id")
                .eq("conversation_id", conversationId)
                .eq("user_id", user.id)
                .maybeSingle();

        if (senderError || !senderMembership) {
            return NextResponse.json(
                { error: "You are not a member of this conversation" },
                { status: 403 }
            );
        }

        // Find the other members of this conversation.
        const { data: members, error: membersError } =
            await supabase
                .from("conversation_members")
                .select("user_id")
                .eq("conversation_id", conversationId);

        if (membersError) {
            throw membersError;
        }

        const recipients = [
            ...new Set(
                (members ?? [])
                    .map((member) => member.user_id)
                    .filter((id) => id !== user.id)
            ),
        ];

        // Send a push notification to each other member.
        await Promise.all(
            recipients.map((recipientId) =>
                sendPushNotification(recipientId, {
                    title: "New SEAConnect message",
                    body: message.content.slice(0, 120),
                    url: `/chat?conversation=${conversationId}`,
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Chat push notification error:", error);

        return NextResponse.json(
            { error: "Could not send chat notifications" },
            { status: 500 }
        );
    }
}
