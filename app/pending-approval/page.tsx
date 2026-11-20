"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MembershipInfo = {
    status: "pending" | "active" | "rejected";
    requested_at: string;
    schools: {
        name: string;
        short_name: string;
        city: string | null;
        state: string | null;
        community_enabled: boolean;
    } | null;
};

export default function PendingApprovalPage() {
    const router = useRouter();
    const [membership, setMembership] = useState<MembershipInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadMembership = useCallback(async () => {
        setLoading(true);
        setError("");

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.replace("/signin");
            return;
        }

        const { data, error: queryError } = await supabase
            .from("school_memberships")
            .select("status,requested_at,schools(name,short_name,city,state,community_enabled)")
            .eq("user_id", user.id)
            .order("requested_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (queryError) {
            setError("We couldn't check your school membership yet. Please try again.");
            setLoading(false);
            return;
        }

        const result = data as MembershipInfo | null;
        if (result?.status === "active") {
            router.replace("/dashboard");
            return;
        }

        setMembership(result);
        setLoading(false);
    }, [router]);

    useEffect(() => {
        void loadMembership();
    }, [loadMembership]);

    const school = membership?.schools;

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#071522] px-5 py-10 text-white">
            <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#102B46] p-7 text-center shadow-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16803A] text-2xl">
                    🌍
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#F4C430]">
                    SEAConnect
                </p>
                <h1 className="mt-2 text-2xl font-bold">School membership</h1>

                {loading ? (
                    <p className="mt-5 text-sm text-slate-300">Checking your membership…</p>
                ) : error ? (
                    <div className="mt-5">
                        <p role="alert" className="text-sm text-red-300">{error}</p>
                        <button onClick={() => void loadMembership()} className="mt-5 rounded-xl bg-[#F15A24] px-5 py-3 text-sm font-bold text-white">
                            Try again
                        </button>
                    </div>
                ) : membership?.status === "pending" ? (
                    <>
                        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                            <p className="font-semibold text-amber-200">
                                {school?.community_enabled ? "Awaiting officer approval" : "Campus onboarding is not open yet"}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                {school?.community_enabled
                                    ? `Your request to join ${school?.name ?? "your selected school"} has been submitted. A SEA officer from that campus must approve your membership before you can access its community.`
                                    : `Your request for ${school?.name ?? "this school"} has been recorded. This campus has not launched its SEAConnect community yet. The platform team will need to onboard the school and assign its first SEA officer before memberships can be approved.`}
                            </p>
                        </div>
                        <p className="mt-4 text-xs text-slate-400">
                            Selected campus: {school?.short_name ?? "School selected"}
                            {school?.city && school?.state ? ` · ${school.city}, ${school.state}` : ""}
                        </p>
                    </>
                ) : membership?.status === "rejected" ? (
                    <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4">
                        <p className="font-semibold text-red-200">Membership not approved</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Your request was not approved. Please contact the SEA officers at {school?.short_name ?? "your selected school"} if you believe this was a mistake.
                        </p>
                    </div>
                ) : (
                    <p className="mt-5 text-sm leading-6 text-slate-300">
                        We couldn't find a school membership request for this account. Please contact the SEAConnect team for help.
                    </p>
                )}

                <div className="mt-7 flex flex-col gap-3">
                    <button onClick={() => void loadMembership()} disabled={loading} className="w-full rounded-xl bg-[#F15A24] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#df4d1b] disabled:opacity-50">
                        Refresh membership status
                    </button>
                    <Link href="/signin" className="text-sm font-semibold text-slate-300 hover:text-white">
                        Return to sign in
                    </Link>
                </div>
            </section>
        </main>
    );
}
