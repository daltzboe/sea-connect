"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const SchoolNameContext = createContext("your campus");

export default function SchoolProvider({
    children,
    initialSchoolName,
}: {
    children: ReactNode;
    initialSchoolName?: string | null;
}) {
    const [schoolName, setSchoolName] = useState(initialSchoolName || "your campus");

    useEffect(() => {
        let active = true;

        async function loadSchool(userId: string | null) {
            if (active) setSchoolName("your campus");
            if (!userId) {
                if (active) setSchoolName("your campus");
                return;
            }

            // Platform Admin campus previews use a server-validated HTTP-only cookie.
            // Keep that campus label instead of the admin account's own null school ID.
            if (initialSchoolName) {
                if (active) setSchoolName(initialSchoolName);
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("primary_school_id")
                .eq("id", userId)
                .maybeSingle();

            if (!active || !profile?.primary_school_id) return;

            const { data: school } = await supabase
                .from("schools")
                .select("short_name")
                .eq("id", profile.primary_school_id)
                .maybeSingle();

            if (active && school?.short_name) {
                setSchoolName(school.short_name);
            }
        }

        void supabase.auth.getUser().then(({ data: { user } }) => {
            void loadSchool(user?.id ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                void Promise.resolve().then(() => loadSchool(session?.user.id ?? null));
            }
        );

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <SchoolNameContext.Provider value={schoolName}>
            {children}
        </SchoolNameContext.Provider>
    );
}

export function SchoolShortName() {
    const schoolName = useContext(SchoolNameContext);
    return <>{schoolName}</>;
}

export function useSchoolShortName() {
    return useContext(SchoolNameContext);
}
