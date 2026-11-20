import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SchoolProvider from "@/components/SchoolProvider";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SEAConnect",
    template: "%s | SEAConnect",
  },
  description:
      "The digital hub connecting Students of East Africa across university campuses.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { isPlatformAdmin, activeAdminSchool } = await getCurrentProfile();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    <body className="min-h-full flex flex-col">
    <SchoolProvider initialSchoolName={activeAdminSchool?.short_name ?? null}>
      {isPlatformAdmin && activeAdminSchool && (
        <div className="sticky top-0 z-[100] border-b border-[#F4C430]/30 bg-[#071522] px-4 py-3 text-white shadow-lg">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4C430]">Platform Admin · Campus preview</p>
              <p className="text-sm font-bold">{activeAdminSchool.name}</p>
            </div>
            <Link href="/admin/schools" className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              ← Back to Admin Schools
            </Link>
          </div>
        </div>
      )}
      {children}
    </SchoolProvider>
    <ServiceWorkerRegistration />
    </body>
    </html>
  );
}
