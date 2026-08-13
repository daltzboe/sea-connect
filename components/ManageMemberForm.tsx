"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Member = {
    id: string;
    full_name: string | null;
    role: string | null;
    position: string | null;
    country: string | null;
};

export default function ManageMemberForm({
                                             member,
                                         }: {
    member: Member;
}) {
    const router = useRouter();

    const [role, setRole] = useState(
        member.role || "member"
    );

    const [position, setPosition] = useState(
        member.position || "SEA Member"
    );

    const [country, setCountry] = useState(
        member.country || ""
    );

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                role,
                position,
                country,
            })
            .eq("id", member.id);

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setMessage("Member updated successfully.");

        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-5 rounded-2xl bg-white p-6 shadow-sm"
        >

            <h2 className="text-lg font-bold">
                Member Details
            </h2>

            {/* Role */}
            <div className="mt-5">

                <label
                    htmlFor="role"
                    className="text-sm font-semibold"
                >
                    Role
                </label>

                <select
                    id="role"
                    value={role}
                    onChange={(event) =>
                        setRole(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#F15A24]"
                >
                    <option value="member">
                        Member
                    </option>

                    <option value="officer">
                        Officer
                    </option>
                </select>

            </div>

            {/* Position */}
            <div className="mt-5">

                <label
                    htmlFor="position"
                    className="text-sm font-semibold"
                >
                    Position
                </label>

                <input
                    id="position"
                    type="text"
                    value={position}
                    onChange={(event) =>
                        setPosition(event.target.value)
                    }
                    placeholder="SEA Member"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#F15A24]"
                />

            </div>

            {/* Country */}
            <div className="mt-5">

                <label
                    htmlFor="country"
                    className="text-sm font-semibold"
                >
                    Country
                </label>

                <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(event) =>
                        setCountry(event.target.value)
                    }
                    placeholder="Country"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#16803A]"
                />

            </div>

            {/* Error */}
            {error && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Success */}
            {message && (
                <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {/* Save */}
            <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-[#F15A24] px-4 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading
                    ? "Saving..."
                    : "Save Changes"}
            </button>

        </form>
    );
}