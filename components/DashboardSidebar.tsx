"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardSidebarProps = {
    fullName: string;
    isOfficer: boolean;
};

const navigation = [
    { href: "/dashboard", label: "Home", icon: "⌂" },
    { href: "/events", label: "Events", icon: "▦" },
    { href: "/announcements", label: "Announcements", icon: "◉" },
    { href: "/meetings", label: "Meetings", icon: "▣" },
    { href: "/members", label: "Members", icon: "♧" },
    { href: "/chat", label: "Community chat", icon: "☷" },
    { href: "/notifications", label: "Notifications", icon: "♢" },
];

export default function DashboardSidebar({ fullName, isOfficer }: DashboardSidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const initials = fullName.trim().split(/\s+/).slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase()).join("");

    function active(href: string) {
        return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    }

    function links() {
        return (
            <>
                {navigation.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={active(item.href) ? "page" : undefined}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active(item.href)
                            ? "bg-[#F15A24] text-white shadow-lg shadow-orange-950/20"
                            : "text-slate-300 hover:bg-white/8 hover:text-white"}`}
                    >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg ${active(item.href) ? "bg-white/15" : "bg-white/5"}`}>
                            {item.icon}
                        </span>
                        {item.label}
                        {active(item.href) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                    </Link>
                ))}
                {isOfficer && (
                    <Link href="/admin" onClick={() => setIsOpen(false)}
                        className="mt-3 flex items-center gap-3 rounded-xl border border-[#F15A24]/30 bg-[#F15A24]/10 px-3 py-3 text-sm font-bold text-orange-200 hover:bg-[#F15A24]/20">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F15A24]/20">⚙</span>
                        Officer dashboard
                    </Link>
                )}
            </>
        );
    }

    function identity() {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#F4C430] bg-[#173B5D] text-sm font-extrabold text-white">
                        {initials || "S"}
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white">{fullName}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">SEA community member</span>
                    </span>
                </div>
                <Link href="/profile" onClick={() => setIsOpen(false)}
                    className="mt-4 block rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-bold text-slate-300 transition hover:border-[#F15A24]/50 hover:text-white">
                    View my profile
                </Link>
            </div>
        );
    }

    return (
        <>
            <button type="button" aria-label="Open navigation menu" aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
                className="fixed left-4 top-5 z-[70] flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#102B46] text-xl text-white shadow-lg lg:hidden">
                ☰
            </button>

            {isOpen && (
                <button type="button" aria-label="Close navigation menu" onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-[75] bg-black/65 backdrop-blur-sm lg:hidden" />
            )}

            <aside className="fixed inset-y-0 left-0 z-[80] hidden w-[272px] flex-col border-r border-white/10 bg-[#0A1E32] px-5 py-6 lg:flex">
                <Link href="/dashboard" className="flex items-center gap-3 px-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F15A24] text-2xl shadow-lg shadow-orange-950/30">🌍</span>
                    <span>
                        <span className="block text-sm font-black tracking-[0.16em] text-white">SEACONNECT</span>
                        <span className="mt-1 block text-[10px] font-medium tracking-wide text-slate-400">STUDENTS OF EAST AFRICA</span>
                    </span>
                </Link>
                <div className="mt-9 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Your campus</div>
                <nav aria-label="Main navigation" className="mt-3 flex flex-1 flex-col gap-1">{links()}</nav>
                {identity()}
                <div className="mt-5 flex items-center gap-2 px-2 text-[10px] font-semibold tracking-wide text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16803A]" />
                    ONE COMMUNITY. MANY CULTURES.
                </div>
            </aside>

            <aside aria-label="Mobile navigation"
                className={`fixed inset-y-0 left-0 z-[80] flex w-[min(84vw,300px)] flex-col border-r border-white/10 bg-[#0A1E32] px-5 py-6 shadow-2xl transition-transform duration-300 lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between px-2">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F15A24] text-xl">🌍</span>
                        <span>
                            <span className="block text-sm font-black tracking-[0.14em] text-white">SEACONNECT</span>
                            <span className="mt-0.5 block text-[10px] text-slate-400">Students of East Africa</span>
                        </span>
                    </Link>
                    <button type="button" onClick={() => setIsOpen(false)} aria-label="Close menu"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 text-lg text-white">×</button>
                </div>
                <div className="mt-9 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Explore SEAConnect</div>
                <nav aria-label="Main navigation" className="mt-3 flex flex-1 flex-col gap-1">{links()}</nav>
                {identity()}
            </aside>
        </>
    );
}
