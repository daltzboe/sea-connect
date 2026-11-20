import BottomNav from "@/components/BottomNav";
import SchoolMembershipReview from "@/components/SchoolMembershipReview";

export default function SchoolMembershipsPage() {
    return (
        <main className="min-h-screen bg-[#071522] pb-24 text-white lg:pl-[248px]">
            <div className="mx-auto max-w-3xl px-5 py-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F4C430]">SEAConnect Administration</p>
                <h1 className="mt-2 text-3xl font-black">School membership</h1>
                <p className="mt-2 text-sm text-slate-300">Approve or reject requests to join your campus community.</p>
                <div className="mt-7">
                    <SchoolMembershipReview />
                </div>
            </div>
            <BottomNav />
        </main>
    );
}
