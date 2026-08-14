import { createSupabaseBrowserClient } from "@/lib/supabase";

export type Notification = {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
};

export async function getNotifications(): Promise<Notification[]> {
    const supabase = createSupabaseBrowserClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        console.error(
            "Could not load notifications:",
            error.message
        );

        return [];
    }

    return data ?? [];
}

export async function getUnreadNotificationCount(): Promise<number> {
    const supabase = createSupabaseBrowserClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return 0;
    }

    const { count, error } = await supabase
        .from("notifications")
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (error) {
        console.error(
            "Could not load notification count:",
            error.message
        );

        return 0;
    }

    return count ?? 0;
}

export async function markNotificationAsRead(
    notificationId: string
) {
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
        .from("notifications")
        .update({
            is_read: true,
        })
        .eq("id", notificationId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function markAllNotificationsAsRead(
    userId: string
) {
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
        .from("notifications")
        .update({
            is_read: true,
        })
        .eq("user_id", userId)
        .eq("is_read", false);

    if (error) {
        throw new Error(error.message);
    }
}