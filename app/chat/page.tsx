"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";

type Member = {
    id: string;
    full_name: string | null;
};

type Conversation = {
    id: string;
    title: string | null;
    is_group: boolean;
    created_at: string;
    displayTitle: string;
};

type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
};

export default function ChatPage() {
    const supabase = useMemo(
        () => createSupabaseBrowserClient(),
        []
    );

    const [userId, setUserId] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeGroupMembers, setActiveGroupMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState("");
    const [groupTitle, setGroupTitle] = useState("");
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const activeConversation = conversations.find(
        (conversation) => conversation.id === activeId
    );

    // Load the signed-in user, members, and conversations.
    useEffect(() => {
        let cancelled = false;

        async function initializeChat() {
            setLoading(true);
            setError("");

            try {
                const {
                    data: { user },
                    error: authError,
                } = await supabase.auth.getUser();

                if (authError || !user) {
                    window.location.href = "/signin";
                    return;
                }

                if (cancelled) return;

                setUserId(user.id);

                const [
                    { data: memberRows, error: memberError },
                    { data: membershipRows, error: membershipError },
                ] = await Promise.all([
                    supabase
                        .from("profiles")
                        .select("id, full_name")
                        .neq("id", user.id)
                        .order("full_name", { ascending: true }),

                    supabase
                        .from("conversation_members")
                        .select("conversation_id")
                        .eq("user_id", user.id),
                ]);

                if (memberError) throw memberError;
                if (membershipError) throw membershipError;
                if (cancelled) return;

                setMembers((memberRows ?? []) as Member[]);

                const conversationIds = [
                    ...new Set(
                        (membershipRows ?? []).map(
                            (row) => row.conversation_id
                        )
                    ),
                ];

                if (conversationIds.length === 0) {
                    setConversations([]);
                    setActiveId("");
                    return;
                }

                const [
                    { data: conversationRows, error: conversationError },
                    { data: participantRows, error: participantError },
                ] = await Promise.all([
                    supabase
                        .from("conversations")
                        .select("id, title, is_group, created_at")
                        .in("id", conversationIds)
                        .order("created_at", { ascending: false }),

                    supabase
                        .from("conversation_members")
                        .select("conversation_id, user_id")
                        .in("conversation_id", conversationIds),
                ]);

                if (conversationError) throw conversationError;
                if (participantError) throw participantError;

                const participantIds = [
                    ...new Set(
                        (participantRows ?? []).map(
                            (row) => row.user_id
                        )
                    ),
                ];

                const {
                    data: participantProfiles,
                    error: profileError,
                } = participantIds.length > 0
                    ? await supabase
                        .from("profiles")
                        .select("id, full_name")
                        .in("id", participantIds)
                    : { data: [], error: null };

                if (profileError) throw profileError;
                if (cancelled) return;

                const namesById = new Map(
                    ((participantProfiles ?? []) as Member[]).map(
                        (member) => [
                            member.id,
                            member.full_name || "SEA Member",
                        ]
                    )
                );

                const formatted: Conversation[] = (
                    conversationRows ?? []
                ).map((conversation) => {
                    const others = (participantRows ?? [])
                        .filter(
                            (participant) =>
                                participant.conversation_id === conversation.id &&
                                participant.user_id !== user.id
                        )
                        .map(
                            (participant) =>
                                namesById.get(participant.user_id) ??
                                "SEA Member"
                        );

                    return {
                        ...conversation,
                        displayTitle: conversation.is_group
                            ? conversation.title || "SEA Group Chat"
                            : others[0] || "Conversation",
                    };
                });

                setConversations(formatted);

                setActiveId((current) =>
                    formatted.some(
                        (conversation) => conversation.id === current
                    )
                        ? current
                        : formatted[0]?.id ?? ""
                );
            } catch (err) {
                console.error("Could not load chat:", err);

                if (!cancelled) {
                    setError(
                        "Could not load chats. Please refresh and try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void initializeChat();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    // Load the selected conversation's members and messages.
    // Subscribe to live message updates.
    useEffect(() => {
        if (!activeId || !userId) {
            setMessages([]);
            setActiveGroupMembers([]);
            return;
        }

        let cancelled = false;

        async function loadGroupMembers() {
            const {
                data: participantRows,
                error: participantError,
            } = await supabase
                .from("conversation_members")
                .select("user_id")
                .eq("conversation_id", activeId);

            if (cancelled) return;

            if (participantError) {
                console.error(
                    "Could not load group members:",
                    participantError
                );
                setActiveGroupMembers([]);
                return;
            }

            const participantIds = [
                ...new Set(
                    (participantRows ?? []).map((row) => row.user_id)
                ),
            ];

            if (participantIds.length === 0) {
                setActiveGroupMembers([]);
                return;
            }

            const {
                data: profiles,
                error: profilesError,
            } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", participantIds);

            if (cancelled) return;

            if (profilesError) {
                console.error(
                    "Could not load member names:",
                    profilesError
                );
                setActiveGroupMembers([]);
                return;
            }

            setActiveGroupMembers((profiles ?? []) as Member[]);
        }

        async function loadMessages() {
            setError("");

            const { data, error: messageError } = await supabase
                .from("messages")
                .select("id, conversation_id, sender_id, content, created_at")
                .eq("conversation_id", activeId)
                .order("created_at", { ascending: true })
                .limit(200);

            if (cancelled) return;

            if (messageError) {
                console.error("Could not load messages:", messageError);
                setError("Could not load messages for this conversation.");
                return;
            }

            setMessages((data ?? []) as Message[]);
        }

        void loadGroupMembers();
        void loadMessages();

        const channel = supabase
            .channel(`chat-${activeId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${activeId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    setMessages((current) =>
                        current.some(
                            (message) => message.id === newMessage.id
                        )
                            ? current
                            : [...current, newMessage].sort(
                                (a, b) =>
                                    new Date(a.created_at).getTime() -
                                    new Date(b.created_at).getTime()
                            )
                    );
                }
            )
            .subscribe();

        return () => {
            cancelled = true;
            void supabase.removeChannel(channel);
        };
    }, [activeId, userId, supabase]);

    async function startConversation() {
        if (!userId || !selectedMember) {
            setError("Choose a member first.");
            return;
        }

        setError("");

        try {
            // Look for a direct conversation with this exact member.
            for (const conversation of conversations) {
                if (conversation.is_group) continue;

                const { data: participants, error: lookupError } =
                    await supabase
                        .from("conversation_members")
                        .select("user_id")
                        .eq("conversation_id", conversation.id);

                if (lookupError) throw lookupError;

                const participantIds = (participants ?? []).map(
                    (participant) => participant.user_id
                );

                if (
                    participantIds.length === 2 &&
                    participantIds.includes(userId) &&
                    participantIds.includes(selectedMember)
                ) {
                    setActiveId(conversation.id);
                    setSelectedMember("");
                    return;
                }
            }

            const {
                data: conversation,
                error: createError,
            } = await supabase
                .from("conversations")
                .insert({
                    created_by: userId,
                    is_group: false,
                    title: null,
                })
                .select("id, title, is_group, created_at")
                .single();

            if (createError) throw createError;

            const { error: participantsError } = await supabase
                .from("conversation_members")
                .insert([
                    {
                        conversation_id: conversation.id,
                        user_id: userId,
                    },
                    {
                        conversation_id: conversation.id,
                        user_id: selectedMember,
                    },
                ]);

            if (participantsError) {
                console.error(
                    "Could not add chat participants:",
                    participantsError
                );
                setError(
                    "The chat was created, but participants could not be added. Check your Supabase policies."
                );
                return;
            }

            const otherMember = members.find(
                (member) => member.id === selectedMember
            );

            const newConversation: Conversation = {
                ...conversation,
                displayTitle: otherMember?.full_name || "SEA Member",
            };

            setConversations((current) => [
                newConversation,
                ...current.filter(
                    (item) => item.id !== conversation.id
                ),
            ]);

            setActiveId(conversation.id);
            setSelectedMember("");
        } catch (err) {
            console.error("Could not start conversation:", err);
            setError(
                "Could not start the conversation. Check your connection and permissions."
            );
        }
    }

    async function createGroup() {
        const title = groupTitle.trim();

        if (!userId) {
            setError("Please sign in again.");
            return;
        }

        if (!title) {
            setError("Enter a name for your group.");
            return;
        }

        if (selectedGroupMembers.length < 2) {
            setError("Select at least two other members for your group.");
            return;
        }

        setCreatingGroup(true);
        setError("");

        try {
            const {
                data: conversation,
                error: createError,
            } = await supabase
                .from("conversations")
                .insert({
                    created_by: userId,
                    is_group: true,
                    title,
                })
                .select("id, title, is_group, created_at")
                .single();

            if (createError) throw createError;

            const participantIds = [
                ...new Set([userId, ...selectedGroupMembers]),
            ];

            const { error: participantsError } = await supabase
                .from("conversation_members")
                .insert(
                    participantIds.map((participantId) => ({
                        conversation_id: conversation.id,
                        user_id: participantId,
                    }))
                );

            if (participantsError) {
                console.error(
                    "Could not add group participants:",
                    participantsError
                );
                setError(
                    "The group was created, but its members could not be added. Check your Supabase policies."
                );
                return;
            }

            const newConversation: Conversation = {
                ...conversation,
                displayTitle: title,
            };

            setConversations((current) => [
                newConversation,
                ...current.filter(
                    (item) => item.id !== conversation.id
                ),
            ]);

            setActiveId(conversation.id);
            setGroupTitle("");
            setSelectedGroupMembers([]);
        } catch (err) {
            console.error("Could not create group:", err);
            setError("Could not create the group. Please try again.");
        } finally {
            setCreatingGroup(false);
        }
    }

    async function sendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const content = messageText.trim();

        if (!content || !activeId || !userId || sending) return;

        setSending(true);
        setError("");

        try {
            const { data, error: sendError } = await supabase
                .from("messages")
                .insert({
                    conversation_id: activeId,
                    sender_id: userId,
                    content,
                })
                .select(
                    "id, conversation_id, sender_id, content, created_at"
                )
                .single();

            if (sendError) throw sendError;

// Update the chat immediately.
            setMessages((current) =>
                current.some((message) => message.id === data.id)
                    ? current
                    : [...current, data as Message].sort(
                        (a, b) =>
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                    )
            );

// Send push notifications to the other conversation members.
            try {
                const response = await fetch("/api/chat/notify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        conversationId: activeId,
                        messageId: data.id,
                    }),
                });

                if (!response.ok) {
                    console.error(
                        "Message was sent, but push notifications failed:",
                        await response.text()
                    );
                }
            } catch (notificationError) {
                console.error(
                    "Message was sent, but push notifications failed:",
                    notificationError
                );
            }

            setMessageText("");

        } catch (err) {
            console.error("Could not send message:", err);
            setError("Message not sent. Please try again.");
        } finally {
            setSending(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F5F7FA] pb-28 text-[#0C2340]">
            <header className="bg-[#071522] text-white">
                <div className="mx-auto max-w-lg px-5 pb-6 pt-8">
                    <Link
                        href="/dashboard"
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Dashboard
                    </Link>

                    <div className="mt-5 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F15A24] text-2xl">
                            💬
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#F4C430]">
                                SEAConnect
                            </p>
                            <h1 className="text-2xl font-extrabold">
                                Member Chat
                            </h1>
                        </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-300">
                        Stay connected with the SEA community.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-lg space-y-5 px-4 py-5">
                <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/70">
                    <h2 className="font-bold">Start a conversation</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Choose a SEAConnect member to message.
                    </p>

                    <div className="mt-3 flex gap-2">
                        <select
                            value={selectedMember}
                            onChange={(event) =>
                                setSelectedMember(event.target.value)
                            }
                            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#F15A24]"
                        >
                            <option value="">Select a member</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.full_name || "SEA Member"}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={startConversation}
                            disabled={!selectedMember}
                            className="rounded-xl bg-[#F15A24] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                        >
                            Chat
                        </button>
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/70">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                            👥
                        </div>
                        <div>
                            <h2 className="font-bold">Create a group chat</h2>
                            <p className="text-sm text-gray-500">
                                Bring SEA members together.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-4">
                        <div>
                            <label
                                htmlFor="groupTitle"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Group name
                            </label>
                            <input
                                id="groupTitle"
                                type="text"
                                value={groupTitle}
                                onChange={(event) =>
                                    setGroupTitle(event.target.value)
                                }
                                placeholder="e.g. SEA Game Night Team"
                                maxLength={80}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#F15A24]"
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-semibold">
                                Select members ({selectedGroupMembers.length} selected)
                            </p>

                            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
                                {members.length === 0 ? (
                                    <p className="p-3 text-sm text-gray-500">
                                        No other members found.
                                    </p>
                                ) : (
                                    members.map((member) => (
                                        <label
                                            key={member.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedGroupMembers.includes(member.id)}
                                                onChange={(event) => {
                                                    setSelectedGroupMembers((current) =>
                                                        event.target.checked
                                                            ? [...current, member.id]
                                                            : current.filter(
                                                                (id) => id !== member.id
                                                            )
                                                    );
                                                }}
                                                className="h-4 w-4 accent-[#F15A24]"
                                            />
                                            <span className="text-sm font-medium">
                                                {member.full_name || "SEA Member"}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>

                            <p className="mt-2 text-xs text-gray-500">
                                Select at least two members. You'll be included automatically.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={createGroup}
                            disabled={
                                creatingGroup ||
                                !groupTitle.trim() ||
                                selectedGroupMembers.length < 2
                            }
                            className="w-full rounded-xl bg-[#0C2340] px-4 py-3 font-bold text-white transition hover:bg-[#16395F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creatingGroup ? "Creating group..." : "＋ Create Group"}
                        </button>
                    </div>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
                        Loading your chats...
                    </div>
                ) : (
                    <>
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70">
                            <div className="border-b border-gray-100 px-4 py-3">
                                <h2 className="font-bold">Your conversations</h2>
                            </div>

                            {conversations.length === 0 ? (
                                <div className="p-6 text-center">
                                    <div className="text-3xl">👋</div>
                                    <p className="mt-3 font-bold">
                                        No conversations yet
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Select a member above to start chatting.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {conversations.map((conversation) => (
                                        <button
                                            type="button"
                                            key={conversation.id}
                                            onClick={() =>
                                                setActiveId(conversation.id)
                                            }
                                            className={`flex w-full items-center gap-3 p-4 text-left transition ${
                                                activeId === conversation.id
                                                    ? "bg-orange-50"
                                                    : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C2340] font-bold text-white">
                                                {conversation.displayTitle
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-bold">
                                                    {conversation.displayTitle}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {conversation.is_group
                                                        ? "Group conversation"
                                                        : "Direct message"}
                                                </p>
                                            </div>

                                            {activeId === conversation.id && (
                                                <span className="h-2 w-2 rounded-full bg-[#F15A24]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {activeConversation && (
                            <section className="flex min-h-[430px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70">
                                <div className="flex items-center gap-3 border-b border-gray-100 bg-[#0C2340] px-4 py-4 text-white">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold">
                                        {activeConversation.displayTitle
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="font-bold">
                                            {activeConversation.displayTitle}
                                        </h2>

                                        <p className="text-xs text-gray-300">
                                            {activeConversation.is_group
                                                ? `${activeGroupMembers.length} members in this group`
                                                : "SEAConnect chat"}
                                        </p>

                                        {activeConversation.is_group && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {activeGroupMembers.map((member) => (
                                                    <span
                                                        key={member.id}
                                                        className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white"
                                                    >
                                                        {member.full_name || "SEA Member"}
                                                        {member.id === userId ? " (You)" : ""}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 bg-[#F8FAFC] p-4">
                                    {messages.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-2xl">💬</p>
                                            <p className="mt-3 font-bold">
                                                Say hello!
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Your conversation starts here.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const mine = message.sender_id === userId;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${
                                                        mine
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                                            mine
                                                                ? "rounded-br-md bg-[#0C2340] text-white"
                                                                : "rounded-bl-md border border-gray-100 bg-white text-[#0C2340]"
                                                        }`}
                                                    >
                                                        <p className="whitespace-pre-wrap break-words text-sm leading-5">
                                                            {message.content}
                                                        </p>

                                                        <p
                                                            className={`mt-2 text-right text-[10px] ${
                                                                mine
                                                                    ? "text-gray-300"
                                                                    : "text-gray-400"
                                                            }`}
                                                        >
                                                            {new Date(
                                                                message.created_at
                                                            ).toLocaleTimeString([], {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <form
                                    onSubmit={sendMessage}
                                    className="flex items-end gap-2 border-t border-gray-100 bg-white p-3"
                                >
                                    <textarea
                                        value={messageText}
                                        onChange={(event) =>
                                            setMessageText(event.target.value)
                                        }
                                        placeholder="Write a message..."
                                        rows={1}
                                        maxLength={3000}
                                        className="max-h-28 min-w-0 flex-1 resize-y rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#F15A24]"
                                    />

                                    <button
                                        type="submit"
                                        disabled={sending || !messageText.trim()}
                                        className="rounded-xl bg-[#F15A24] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                                    >
                                        {sending ? "..." : "Send"}
                                    </button>
                                </form>
                            </section>
                        )}
                    </>
                )}
            </div>

            <BottomNav />
        </main>
    );
}