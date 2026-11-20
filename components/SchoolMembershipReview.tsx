"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RequestRow = {
    id: string;
    school_id: string;
    user_id: string;
    requested_at: string;
};

type ProfileRow = {
    id: string;
    full_name: string | null;
    country: string | null;
};

type SchoolRow = {
    id: string;
    name: string;
    short_name: string;
};

export default function SchoolMembershipReview() {
    const [requests, setRequests] = useState<RequestRow[]>([]);
    const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
    const [schools, setSchools] = useState<Record<string, SchoolRow>>({});
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError("");
        setMessage("");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Please sign in to review school memberships.");
            setLoading(false);
            return;
        }

        const { data: officerRows, error: officerError } = await supabase
            .from("school_memberships")
            .select("school_id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .eq("role", "officer");

        if (officerError || !officerRows?.length) {
            setError("You must be an active SEA officer to review membership requests.");
            setLoading(false);
            return;
        }

        const schoolIds = [...new Set(officerRows.map((row) => row.school_id))];

        const { data: pendingRows, error: requestError } = await supabase
            .from("school_memberships")
            .select("id,school_id,user_id,requested_at")
            .in("school_id", schoolIds)
            .eq("status", "pending")
            .order("requested_at", { ascending: true });

        if (requestError) {
            setError("Could not load membership requests. Please try again.");
            setLoading(false);
            return;
        }

        const nextRequests = (pendingRows ?? []) as RequestRow[];
        setRequests(nextRequests);

        const userIds = [...new Set(nextRequests.map((row) => row.user_id))];
        const [profileResult, schoolResult] = await Promise.all([
            userIds.length
                ? supabase.from("profiles").select("id,full_name,country").in("id", userIds)
                : Promise.resolve({ data: [], error: null }),
            supabase.from("schools").select("id,name,short_name").in("id", schoolIds),
        ]);

        if (profileResult.error || schoolResult.error) {
            setError("Requests loaded, but some school or profile details could not be displayed.");
        }

        const profileMap: Record<string, ProfileRow> = {};
        for (const profile of (profileResult.data ?? []) as ProfileRow[]) {
            profileMap[profile.id] = profile;
        }

        const schoolMap: Record<string, SchoolRow> = {};
        for (const school of (schoolResult.data ?? []) as SchoolRow[]) {
            schoolMap[school.id] = school;
        }

        setProfiles(profileMap);
        setSchools(schoolMap);
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadRequests();
    }, [loadRequests]);

    async function reviewRequest(request: RequestRow, status: "active" | "rejected") {
        setBusyId(request.id);
        setError("");
        setMessage("");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Your session expired. Please sign in again.");
            setBusyId("");
            return;
        }

        const { error: updateError } = await supabase
            .from("school_memberships")
            .update({
                status,
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id,
            })
            .eq("id", request.id)
            .eq("school_id", request.school_id)
            .eq("status", "pending");

        if (updateError) {
            setError("Could not update this request. Confirm that you are an officer for this school.");
            setBusyId("");
            return;
        }

        setMessage(status === "active" ? "Membership approved." : "Membership request rejected.");
        setBusyId("");
        await loadRequests();
    }

    return (
        <section className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#102B46] p-5">
                <h2 className="text-lg font-bold text-white">Pending membership requests</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                    Review students who selected your campus. Approval gives them access to that school&apos;s SEA community.
                </p>
            </div>

            {error && <p role="alert" className="rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-200">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-green-300/20 bg-green-300/10 p-3 text-sm text-green-200">{message}</p>}

            {loading ? (
                <div className="rounded-2xl bg-[#102B46] p-6 text-sm text-slate-300">Loading requests…</div>
            ) : requests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-[#102B46] p-8 text-center">
                    <p className="text-3xl">✓</p>
                    <p className="mt-2 font-semibold text-white">You're all caught up</p>
                    <p className="mt-1 text-sm text-slate-400">There are no pending requests for your school.</p>
                </div>
            ) : (
                requests.map((request) => {
                    const profile = profiles[request.user_id];
                    const school = schools[request.school_id];

                    return (
                        <article key={request.id} className="rounded-2xl border border-white/10 bg-[#102B46] p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold text-white">{profile?.full_name || "SEA Member"}</p>
                                    <p className="mt-1 text-xs text-slate-400">{profile?.country || "Country not provided"}</p>
                                    <p className="mt-2 text-xs font-semibold text-emerald-300">
                                        {school?.short_name || "School"} · {school?.name || "Campus"}
                                    </p>
                                </div>
                                <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">Pending</span>
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                                Requested {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button type="button" disabled={busyId === request.id} onClick={() => void reviewRequest(request, "active")} className="rounded-xl bg-[#16803A] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#126B31] disabled:opacity-50">
                                    {busyId === request.id ? "Saving…" : "Approve"}
                                </button>
                                <button type="button" disabled={busyId === request.id} onClick={() => void reviewRequest(request, "rejected")} className="rounded-xl border border-red-300/30 px-3 py-3 text-sm font-bold text-red-200 transition hover:bg-red-300/10 disabled:opacity-50">
                                    Reject
                                </button>
                            </div>
                        </article>
                    );
                })
            )}
            <button type="button" onClick={() => void loadRequests()} disabled={loading} className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-50">
                Refresh requests
            </button>
        </section>
    );
}
