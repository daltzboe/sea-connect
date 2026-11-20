"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const SchoolNameContext = createContext("your campus");

export default function SchoolProvider({ children }: { children: ReactNode }) {
    const [schoolName, setSchoolName] = useState("your campus");

    useEffect(() => {
        let active = true;

        async function loadSchool(userId: string | null) {
            if (!userId) {
                if (active) setSchoolName("your campus");
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
                void loadSchool(session?.user.id ?? null);
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
    return <>{useContext(SchoolNameContext)}</>;
}

export function useSchoolShortName() {
    return useContext(SchoolNameContext);
}
