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
                Delete User
            </button>
        );
    }

    return (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-700">
                Are you sure you want to delete this user?
            </p>

            <p className="mt-2 text-xs leading-5 text-red-600">
                This permanently deletes their SEAConnect
                account. This action cannot be undone.
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
                        Yes, Delete
                    </button>
                </form>

            </div>

        </div>
    );
}