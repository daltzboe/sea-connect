"use client";
import { SchoolShortName } from "@/components/SchoolProvider";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { href: "/dashboard", label: "Home", icon: "⌂" },
    { href: "/events", label: "Events", icon: "▦" },
    { href: "/announcements", label: "Announcements", icon: "◉" },
    { href: "/meetings", label: "Meetings", icon: "▣" },
    { href: "/members", label: "Members", icon: "♧" },
    { href: "/chat", label: "Student Chat", icon: "☷" },
    { href: "/notifications", label: "Notifications", icon: "♢" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    function navLinks() {
        return items.map((item) => {
            const active = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
                <Link key={item.href} href={item.href} prefetch={true} onClick={() => setIsOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active
                        ? "bg-[#F15A24] text-white shadow-lg shadow-orange-950/20"
                        : "text-slate-300 hover:bg-white/8 hover:text-white"}`}>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg ${active ? "bg-white/15" : "bg-white/5"}`}>{item.icon}</span>
                    {item.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                </Link>
            );
        });
    }

    return (
        <>
            <button type="button" aria-label="Open navigation menu" aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
                className="fixed left-4 top-4 z-[70] flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#102B46] text-xl text-white shadow-lg lg:hidden">
                ☰
            </button>
            {isOpen && (
                <button type="button" aria-label="Close navigation menu" onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-[75] bg-black/65 backdrop-blur-sm lg:hidden" />
            )}

            <aside aria-label="Main navigation" className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-white/10 bg-[#0A1E32] px-5 py-7 lg:flex">
                <Link href="/dashboard" className="flex items-center gap-3 px-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F15A24] text-2xl">🌍</span>
                    <span>
                        <span className="block text-sm font-black tracking-[0.15em] text-white">SEACONNECT</span>
                        <span className="mt-1 block text-[10px] tracking-wide text-slate-400">STUDENTS OF EAST AFRICA</span>
                    </span>
                </Link>
                <p className="mt-10 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Navigate</p>
                <nav aria-label="Main navigation" className="mt-3 flex flex-1 flex-col gap-1">{navLinks()}</nav>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold text-white">One community. Many cultures.</p>
                    <p className="mt-2 text-[11px] leading-5 text-slate-400">Your East African community at <SchoolShortName />.</p>
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
                <p className="mt-9 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Explore SEAConnect</p>
                <nav aria-label="Mobile main navigation" className="mt-3 flex flex-1 flex-col gap-1">{navLinks()}</nav>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold text-white">One community. Many cultures.</p>
                    <p className="mt-2 text-[11px] leading-5 text-slate-400">Your East African community at <SchoolShortName />.</p>
                </div>
            </aside>
        </>
    );
}
