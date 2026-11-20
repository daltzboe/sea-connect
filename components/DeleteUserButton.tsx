"use client";

import { useState } from "react";

type DeleteUserButtonProps = {
    action: () => void;
};

export default function DeleteUserButton({
                                             action,
                                         }: DeleteUserButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    if (!showConfirm) {
        return (
            <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
            >
                Remove from Campus
            </button>
        );
    }

    return (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-700">
                Remove this member from the current campus?
            </p>

            <p className="mt-2 text-xs leading-5 text-red-600">
                Their SEAConnect account and memberships at other schools will remain.
            </p>

            <div className="mt-4 flex gap-3">

                <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0C2340] shadow-sm"
                >
                    Cancel
                </button>

                <form action={action} className="flex-1">
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
                    >
                        Yes, Remove
                    </button>
                </form>

            </div>

        </div>
    );
}