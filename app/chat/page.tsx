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
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);

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
                    setMobileChatOpen(true);
                    setShowNewChat(false);
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
            setMobileChatOpen(true);
            setShowNewChat(false);
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
            setMobileChatOpen(true);
            setShowCreateGroup(false);
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

    const filteredConversations = conversations.filter((conversation) =>
        conversation.displayTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#071522] pb-24 text-white lg:pb-8">
            <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1500px] flex-col px-3 py-3 sm:px-5 lg:min-h-screen lg:px-6 lg:py-6">
                <header className="mb-4 flex items-center justify-between gap-4 px-1">
                    <div>
                        <Link href="/dashboard" className="text-xs font-semibold text-slate-400 transition hover:text-white">
                            ← Dashboard
                        </Link>
                        <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F15A24] text-xl shadow-lg shadow-orange-950/30">💬</div>
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#F4C430]">SEAConnect</p>
                                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Messages</h1>
                            </div>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 sm:flex">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        SEA community
                    </div>
                </header>

                {error && (
                    <div role="alert" className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <section className="grid min-h-[650px] flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0B1D2D] shadow-2xl shadow-black/20 lg:grid-cols-[350px_minmax(0,1fr)]">
                    <aside className={`flex min-h-[650px] flex-col border-r border-white/10 bg-[#0D2235] ${mobileChatOpen ? "hidden lg:flex" : "flex"}`}>
                        <div className="border-b border-white/10 p-4 sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-extrabold">Your chats</h2>
                                    <p className="mt-1 text-xs text-slate-400">Keep up with your SEA people</p>
                                </div>
                                <button type="button" onClick={() => { setShowNewChat((value) => !value); setShowCreateGroup(false); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F15A24] text-xl font-bold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-500" aria-label="Start a new chat" title="New chat">
                                    +
                                </button>
                            </div>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
                                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search conversations" className="w-full rounded-xl border border-white/10 bg-[#071522] py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#F15A24]" />
                            </div>

                            {showNewChat && (
                                <div className="mt-3 rounded-2xl border border-white/10 bg-[#102B46] p-3">
                                    <p className="mb-2 text-sm font-bold">Start a direct message</p>
                                    <select value={selectedMember} onChange={(event) => setSelectedMember(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071522] px-3 py-3 text-sm text-white outline-none focus:border-[#F15A24]">
                                        <option value="">Choose a SEA member</option>
                                        {members.map((member) => <option key={member.id} value={member.id}>{member.full_name || "SEA Member"}</option>)}
                                    </select>
                                    <div className="mt-2 flex gap-2">
                                        <button type="button" onClick={startConversation} disabled={!selectedMember} className="flex-1 rounded-xl bg-[#F15A24] px-3 py-2.5 text-sm font-bold text-white disabled:opacity-40">Open chat</button>
                                        <button type="button" onClick={() => setShowNewChat(false)} className="rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-300">Cancel</button>
                                    </div>
                                    <button type="button" onClick={() => { setShowCreateGroup(true); setShowNewChat(false); }} className="mt-3 w-full text-left text-xs font-semibold text-orange-300 hover:text-orange-200">＋ Create a group instead</button>
                                </div>
                            )}

                            {showCreateGroup && (
                                <div className="mt-3 rounded-2xl border border-white/10 bg-[#102B46] p-3">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-bold">New group</p>
                                        <button type="button" onClick={() => setShowCreateGroup(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
                                    </div>
                                    <input value={groupTitle} onChange={(event) => setGroupTitle(event.target.value)} placeholder="Group name" maxLength={80} className="w-full rounded-xl border border-white/10 bg-[#071522] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#F15A24]" />
                                    <p className="mb-2 mt-3 text-xs text-slate-400">Choose at least two members</p>
                                    <div className="max-h-36 space-y-1 overflow-y-auto">
                                        {members.map((member) => (
                                            <label key={member.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-white/5">
                                                <input type="checkbox" checked={selectedGroupMembers.includes(member.id)} onChange={(event) => setSelectedGroupMembers((current) => event.target.checked ? [...current, member.id] : current.filter((id) => id !== member.id))} className="accent-[#F15A24]" />
                                                {member.full_name || "SEA Member"}
                                            </label>
                                        ))}
                                    </div>
                                    <button type="button" onClick={createGroup} disabled={creatingGroup || !groupTitle.trim() || selectedGroupMembers.length < 2} className="mt-3 w-full rounded-xl bg-[#F15A24] px-3 py-2.5 text-sm font-bold text-white disabled:opacity-40">{creatingGroup ? "Creating..." : "Create group"}</button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-sm text-slate-400">Loading your conversations...</div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">👋</div>
                                    <p className="mt-4 font-bold">{conversations.length === 0 ? "No chats yet" : "No matches found"}</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-400">{conversations.length === 0 ? "Start a conversation with someone in the SEA community." : "Try another name or search term."}</p>
                                    {conversations.length === 0 && <button type="button" onClick={() => setShowNewChat(true)} className="mt-4 rounded-xl bg-[#F15A24] px-4 py-2.5 text-sm font-bold text-white">Start chatting</button>}
                                </div>
                            ) : (
                                <div className="divide-y divide-white/[0.06]">
                                    {filteredConversations.map((conversation) => (
                                        <button key={conversation.id} type="button" onClick={() => { setActiveId(conversation.id); setMobileChatOpen(true); }} className={`flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.04] sm:px-5 ${activeId === conversation.id ? "bg-[#153653]" : ""}`}>
                                            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white ${conversation.is_group ? "bg-gradient-to-br from-[#F15A24] to-amber-500" : "bg-gradient-to-br from-[#245276] to-[#102B46]"}`}>
                                                {conversation.is_group ? "👥" : conversation.displayTitle.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-bold text-white">{conversation.displayTitle}</p>
                                                    <span className="shrink-0 text-[10px] text-slate-500">{conversation.is_group ? "GROUP" : "DIRECT"}</span>
                                                </div>
                                                <p className="mt-1 truncate text-xs text-slate-400">{conversation.is_group ? "Group conversation" : "Tap to open conversation"}</p>
                                            </div>
                                            {activeId === conversation.id && <span className="h-2 w-2 shrink-0 rounded-full bg-[#F15A24]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="border-t border-white/10 px-5 py-3 text-[11px] text-slate-500">A community that stays connected.</div>
                    </aside>

                    <section className={`min-h-[650px] flex-col bg-[#071522] ${mobileChatOpen ? "flex" : "hidden lg:flex"}`}>
                        {activeConversation ? (
                            <>
                                <div className="flex items-center gap-3 border-b border-white/10 bg-[#0D2235] px-4 py-3.5 sm:px-6">
                                    <button type="button" onClick={() => setMobileChatOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-slate-300 hover:bg-white/10 lg:hidden" aria-label="Back to conversations">‹</button>
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-white ${activeConversation.is_group ? "bg-gradient-to-br from-[#F15A24] to-amber-500" : "bg-[#245276]"}`}>
                                        {activeConversation.is_group ? "👥" : activeConversation.displayTitle.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="truncate font-extrabold text-white">{activeConversation.displayTitle}</h2>
                                        <p className="mt-0.5 truncate text-xs text-slate-400">{activeConversation.is_group ? `${activeGroupMembers.length} members · Group conversation` : "SEAConnect member"}</p>
                                    </div>
                                    <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 sm:block">SEAConnect</div>
                                </div>

                                {activeConversation.is_group && (
                                    <div className="flex flex-wrap gap-2 border-b border-white/[0.06] bg-[#0A1B2A] px-4 py-2.5 sm:px-6">
                                        {activeGroupMembers.map((member) => (
                                            <span key={member.id} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-slate-300">{member.full_name || "SEA Member"}{member.id === userId ? " · You" : ""}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#102B46] via-[#071522] to-[#071522] px-3 py-5 sm:px-6">
                                    <div className="mx-auto mb-5 w-fit rounded-full border border-white/10 bg-[#102B46]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Messages are part of the SEA community</div>
                                    {messages.length === 0 ? (
                                        <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F15A24]/10 text-3xl">👋</div>
                                            <p className="mt-4 font-bold text-white">Say hello!</p>
                                            <p className="mt-1 max-w-xs text-sm text-slate-400">Start the conversation. Your SEA community is one message away.</p>
                                        </div>
                                    ) : (
                                        messages.map((message, index) => {
                                            const mine = message.sender_id === userId;
                                            const previous = messages[index - 1];
                                            const showSender = activeConversation.is_group && !mine && (!previous || previous.sender_id !== message.sender_id);
                                            const senderName = activeGroupMembers.find((member) => member.id === message.sender_id)?.full_name || "SEA Member";
                                            return (
                                                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[75%] sm:px-4 ${mine ? "rounded-br-md bg-[#F15A24] text-white" : "rounded-bl-md border border-white/[0.07] bg-[#153653] text-slate-100"}`}>
                                                        {showSender && <p className="mb-1 text-[10px] font-bold text-orange-300">{senderName}</p>}
                                                        <p className="whitespace-pre-wrap break-words text-[13px] leading-5 sm:text-sm">{message.content}</p>
                                                        <p className={`mt-1.5 text-right text-[10px] ${mine ? "text-orange-100/80" : "text-slate-400"}`}>
                                                            {new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                                            {mine && <span className="ml-1.5 text-orange-100">✓</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <form onSubmit={sendMessage} className="border-t border-white/10 bg-[#0D2235] p-3 sm:px-5 sm:py-4">
                                    <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#071522] p-2 focus-within:border-[#F15A24]/70">
                                        <textarea value={messageText} onChange={(event) => setMessageText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Write a message..." rows={1} maxLength={3000} className="max-h-32 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500" />
                                        <button type="submit" disabled={sending || !messageText.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F15A24] text-lg font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message" title="Send message">{sending ? "…" : "➤"}</button>
                                    </div>
                                    <p className="mt-2 px-1 text-[10px] text-slate-500">Enter to send · Shift + Enter for a new line</p>
                                </form>
                            </>
                        ) : (
                            <div className="hidden h-full min-h-[650px] flex-col items-center justify-center px-8 text-center lg:flex">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#F15A24]/10 text-4xl">💬</div>
                                <h2 className="mt-6 text-xl font-extrabold">Your SEA conversations</h2>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Choose a chat on the left or start a new conversation with someone in the SEA community.</p>
                                <button type="button" onClick={() => setShowNewChat(true)} className="mt-5 rounded-xl bg-[#F15A24] px-5 py-3 text-sm font-bold text-white hover:bg-orange-500">＋ New message</button>
                            </div>
                        )}
                    </section>
                </section>
            </div>
            <BottomNav />
        </main>
    );
}
