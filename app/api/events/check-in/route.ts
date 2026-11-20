import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
    try {
        const { user, profile } = await getCurrentProfile();
        if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
        if (profile?.role !== "officer") return NextResponse.json({ error: "Only SEA officers can check in attendees." }, { status: 403 });

        const body = await request.json();
        const eventId = typeof body.eventId === "string" ? body.eventId : "";
        const ticketCode = typeof body.ticketCode === "string" ? body.ticketCode.trim() : "";
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuidPattern.test(eventId) || !uuidPattern.test(ticketCode)) {
            return NextResponse.json({ error: "That ticket code is not valid." }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.rpc("check_in_event_ticket", {
            p_event_id: eventId,
            p_ticket_code: ticketCode,
        });

        if (error) {
            const message = error.message || "";
            if (message.includes("ALREADY_CHECKED_IN")) {
                return NextResponse.json({ error: "This ticket has already been checked in." }, { status: 409 });
            }
            if (message.includes("INVALID_TICKET")) {
                return NextResponse.json({ error: "Ticket not found for this event, or the member is no longer marked Going." }, { status: 404 });
            }
            if (message.includes("FORBIDDEN")) {
                return NextResponse.json({ error: "Only SEA officers can check in attendees." }, { status: 403 });
            }
            console.error("Event check-in failed:", message);
            return NextResponse.json({ error: "Could not verify this ticket. Please try again." }, { status: 500 });
        }

        const attendee = Array.isArray(data) ? data[0] : data;
        if (!attendee) return NextResponse.json({ error: "Ticket could not be verified." }, { status: 404 });

        return NextResponse.json({
            success: true,
            attendeeName: attendee.attendee_name,
            eventTitle: attendee.event_title,
            checkedInAt: attendee.checked_in_at,
        });
    } catch (error) {
        console.error("Check-in request failed:", error);
        return NextResponse.json({ error: "Invalid check-in request." }, { status: 400 });
    }
}
