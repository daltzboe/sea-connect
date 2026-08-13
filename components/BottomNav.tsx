"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    {
        label: "Home",
        href: "/dashboard",
        icon: "⌂",
    },
    {
        label: "Events",
        href: "/events",
        icon: "📅",
    },
    {
        label: "Meetings",
        href: "/meetings",
        icon: "🤝",
    },
    {
        label: "Profile",
        href: "/profile",
        icon: "◉",
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">

            <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-gray-200 bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur">

                {navigation.map((item) => {
                    const active =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex min-w-0 flex-1 items-center justify-center rounded-full px-3 py-3 transition-all duration-200 ${
                                active
                                    ? "bg-[#0C2340] text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-[#0C2340]"
                            }`}
                        >

                            <div className="flex items-center gap-2">

                                <span className="text-base">
                                    {item.icon}
                                </span>

                                <span
                                    className={`text-xs font-semibold ${
                                        active
                                            ? "block"
                                            : "hidden sm:block"
                                    }`}
                                >
                                    {item.label}
                                </span>

                            </div>

                        </Link>
                    );
                })}

            </div>

        </nav>
    );
}