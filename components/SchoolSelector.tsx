"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type School = {
    id: string;
    name: string;
    short_name: string;
    city: string | null;
    state: string | null;
    country: string;
    school_type: string;
    slug: string;
};

type SchoolSelectorProps = {
    value: string;
    onChange: (schoolId: string) => void;
};

export default function SchoolSelector({
    value,
    onChange,
}: SchoolSelectorProps) {
    const [schools, setSchools] = useState<School[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadSchools() {
            const { data, error: queryError } = await supabase
                .from("schools")
                .select("id,name,short_name,city,state,country,school_type,slug")
                .eq("is_listed", true)
                .order("name");

            if (!active) return;

            if (queryError) {
                setError("We couldn't load the school directory. Please refresh and try again.");
                setLoading(false);
                return;
            }

            setSchools((data ?? []) as School[]);
            setLoading(false);
        }

        void loadSchools();

        return () => {
            active = false;
        };
    }, []);

    const selectedSchool = schools.find((school) => school.id === value);

    const filteredSchools = useMemo(() => {
        const term = search.trim().toLowerCase();

        const matches = schools.filter((school) => {
            if (!term) return true;

            return [
                school.name,
                school.short_name,
                school.city ?? "",
                school.state ?? "",
                school.country,
            ].some((field) => field.toLowerCase().includes(term));
        });

        matches.sort((a, b) => {
            if (a.slug === "utsa") return -1;
            if (b.slug === "utsa") return 1;
            return a.name.localeCompare(b.name);
        });

        return term ? matches.slice(0, 20) : matches.slice(0, 12);
    }, [schools, search]);

    function chooseSchool(school: School) {
        onChange(school.id);
        setSearch(`${school.short_name} — ${school.name}`);
        setOpen(false);
    }

    return (
        <div className="mt-5">
            <label htmlFor="school-search" className="text-sm font-semibold">
                University or College
            </label>

            <div className="relative mt-2">
                <input
                    id="school-search"
                    type="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls="school-options"
                    autoComplete="off"
                    value={search}
                    onFocus={() => {
                        setOpen(true);
                        if (value) setSearch("");
                    }}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setOpen(true);
                        if (value) onChange("");
                    }}
                    placeholder="Search by school name or abbreviation"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-11 outline-none transition focus:border-[#16803A] focus:ring-2 focus:ring-[#16803A]/10"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {loading ? "…" : "⌕"}
                </span>

                {open && !loading && (
                    <div
                        id="school-options"
                        role="listbox"
                        className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
                    >
                        {filteredSchools.length > 0 ? (
                            filteredSchools.map((school) => (
                                <button
                                    key={school.id}
                                    type="button"
                                    role="option"
                                    aria-selected={value === school.id}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => chooseSchool(school)}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition hover:bg-green-50 focus:bg-green-50 focus:outline-none"
                                >
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-[#0C2340]">
                                            {school.name}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-gray-500">
                                            {school.short_name}
                                            {school.city && school.state
                                                ? ` · ${school.city}, ${school.state}`
                                                : school.country !== "United States"
                                                    ? ` · ${school.country}`
                                                    : ""}
                                        </span>
                                    </span>
                                    {value === school.id && (
                                        <span className="ml-3 text-sm font-bold text-[#16803A]">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <p className="px-3 py-4 text-sm text-gray-500">
                                No schools found. Try another name or abbreviation.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {selectedSchool && (
                <p className="mt-2 text-xs font-medium text-[#16803A]">
                    Selected: {selectedSchool.short_name} · Your request will go to this school&apos;s SEA officers.
                </p>
            )}

            {loading && (
                <p className="mt-2 text-xs text-gray-500">Loading school directory…</p>
            )}

            {error && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                    {error}
                </p>
            )}

            <p className="mt-2 text-xs text-gray-400">
                Search by full university name, campus abbreviation, city, or state.
            </p>
        </div>
    );
}
