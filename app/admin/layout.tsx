import { getCurrentProfile } from "@/lib/profile";
import ExitCampusAdminButton from "@/components/ExitCampusAdminButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isPlatformAdmin, activeAdminSchool } = await getCurrentProfile();

    return (
        <>
            {isPlatformAdmin && activeAdminSchool && (
                <div className="sticky top-0 z-50 border-b border-[#F4C430]/30 bg-[#071522] px-4 py-3 text-white shadow-lg">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4C430]">Platform Admin · Viewing as campus officer</p>
                            <p className="text-sm font-bold">{activeAdminSchool.name}</p>
                        </div>
                        <ExitCampusAdminButton />
                    </div>
                </div>
            )}
            {children}
        </>
    );
}
