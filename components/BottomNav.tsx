"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const items = [
        {
            href: "/dashboard",
            label: "Home",
            icon: "⌂",
        },
        {
            href: "/events",
            label: "Events",
            icon: "📅",
        },
        {
            href: "/announcements",
            label: "News",
            icon: "📢",
        },
        {
            href: "/members",
            label: "Members",
            icon: "👥",
        },
        {
            href: "/profile",
            label: "Profile",
            icon: "👤",
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md">

            <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">

                {items.map((item) => {

                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex min-w-[64px] flex-col items-center rounded-xl px-3 py-2 transition ${
                                isActive
                                    ? "bg-[#16803A]/10 text-[#16803A]"
                                    : "text-gray-400 hover:text-[#0C2340]"
                            }`}
                        >

                            <span
                                className={`text-xl leading-none transition ${
                                    isActive
                                        ? "scale-110"
                                        : ""
                                }`}
                            >
                                {item.icon}
                            </span>

                            <span
                                className={`mt-1 text-[10px] font-semibold ${
                                    isActive
                                        ? "text-[#16803A]"
                                        : "text-gray-400"
                                }`}
                            >
                                {item.label}
                            </span>

                        </Link>
                    );
                })}

            </div>

            {/* SAFE AREA FOR PHONES */}
            <div className="h-[env(safe-area-inset-bottom)]" />

        </nav>
    );
}