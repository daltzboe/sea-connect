"use client";

export default function TestPushButton() {
    async function testPush() {
        const response = await fetch("/api/push/test", {
            method: "POST",
        });

        const data = await response.json();

        console.log("Push test:", data);
    }

    return (
        <button
            onClick={testPush}
            className="mb-6 w-full rounded-xl bg-[#16803A] px-4 py-3 font-bold text-white"
        >
            🔔 Test Push Notification
        </button>
    );
}