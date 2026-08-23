"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        href: "/meetings",
        label: "Meetings",
        icon: "🤝",
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

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md">

            <div className="mx-auto flex max-w-md items-center justify-around px-1 py-2">

                {items.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex min-w-[60px] flex-1 flex-col items-center rounded-xl px-2 py-2 transition-all duration-150 active:scale-95 ${
                                isActive
                                    ? "bg-[#16803A]/10 text-[#16803A]"
                                    : "text-gray-400 hover:text-[#0C2340]"
                            }`}
                        >
                            <span
                                className={`text-xl leading-none transition-transform duration-150 ${
                                    isActive ? "scale-110" : ""
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

            {/* iPhone safe-area spacing */}
            <div className="h-[env(safe-area-inset-bottom)]" />

        </nav>
    );
}