import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";

export default async function AdminPage() {
    const { user, profile, isPlatformAdmin } = await getCurrentProfile();

    if (!user) redirect("/signin");

    if (isPlatformAdmin && !profile?.primary_school_id) {
        redirect("/admin/schools");
    }

    if (profile?.role !== "officer") {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#F4F6F5] px-5 py-10 text-[#0C2340]">
            <div className="mx-auto max-w-3xl">
                <Link href="/dashboard" className="text-sm text-slate-500 hover:text-[#0C2340]">← Back to campus</Link>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#F15A24]">SEAConnect</p>
                <h1 className="mt-2 text-3xl font-black">Campus Admin Panel</h1>
                <p className="mt-2 text-sm text-slate-600">Manage your campus community, members, and activities.</p>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link href="/admin/users" className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
                        <div className="text-3xl">👤</div><h2 className="mt-3 font-bold">Users</h2><p className="mt-1 text-sm text-slate-500">Manage accounts and roles</p>
                    </Link>
                    <Link href="/admin/members" className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
                        <div className="text-3xl">🌍</div><h2 className="mt-3 font-bold">Active Members</h2><p className="mt-1 text-sm text-slate-500">View campus members</p>
                    </Link>
                    <Link href="/admin/events" className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
                        <div className="text-3xl">📅</div><h2 className="mt-3 font-bold">Events</h2><p className="mt-1 text-sm text-slate-500">Manage campus events</p>
                    </Link>
                    <Link href="/admin/announcements" className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
                        <div className="text-3xl">📢</div><h2 className="mt-3 font-bold">Announcements</h2><p className="mt-1 text-sm text-slate-500">Manage campus news</p>
                    </Link>
                    <Link href="/admin/meetings" className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md">
                        <div className="text-3xl">🤝</div><h2 className="mt-3 font-bold">Meetings</h2><p className="mt-1 text-sm text-slate-500">Manage campus meetings</p>
                    </Link>
                </div>
            </div>
        </main>
    );
}
