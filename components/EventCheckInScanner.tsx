"use client";

import { useEffect, useRef, useState } from "react";

type ScannerApi = {
    start: (
        camera: { facingMode: string },
        config: { fps: number; qrbox: { width: number; height: number } },
        onSuccess: (decodedText: string) => void,
        onError?: (message: string) => void
    ) => Promise<void>;
    stop: () => Promise<void>;
    clear: () => void;
};

declare global {
    interface Window {
        Html5Qrcode?: new (elementId: string) => ScannerApi;
    }
}

const SCANNER_SCRIPT = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";

function loadScannerLibrary() {
    return new Promise<void>((resolve, reject) => {
        if (window.Html5Qrcode) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCANNER_SCRIPT}"]`);
        if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Could not load the camera scanner.")), { once: true });
            if (window.Html5Qrcode) resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = SCANNER_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load the camera scanner."));
        document.head.appendChild(script);
    });
}

export default function EventCheckInScanner({ eventId }: { eventId: string }) {
    const scannerRef = useRef<ScannerApi | null>(null);
    const [ticketCode, setTicketCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<{ attendeeName: string; eventTitle: string; checkedInAt: string } | null>(null);

    async function stopScanner() {
        if (!scannerRef.current) return;
        try {
            await scannerRef.current.stop();
            scannerRef.current.clear();
        } catch {
            // The scanner may already have stopped after a successful decode.
        }
        scannerRef.current = null;
        setScanning(false);
    }

    async function checkIn(code: string) {
        const normalized = code.trim();
        if (!normalized || loading) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            await stopScanner();
            const response = await fetch("/api/events/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId, ticketCode: normalized }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Could not check in this ticket.");
            setResult(data);
            setTicketCode("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not check in this ticket.");
        } finally {
            setLoading(false);
        }
    }

    async function startScanner() {
        setError("");
        setResult(null);
        try {
            await loadScannerLibrary();
            if (!window.Html5Qrcode) throw new Error("Camera scanner is unavailable. Enter the ticket code manually.");
            const scanner = new window.Html5Qrcode("sea-qr-reader");
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => { void checkIn(decodedText); },
                () => undefined
            );
            setScanning(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not start camera. Check camera permissions or enter the code manually.");
            await stopScanner();
        }
    }

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                void scannerRef.current.stop().catch(() => undefined);
            }
        };
    }, []);

    return (
        <section className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-[#0C2340]">Scan attendee ticket</h2>
                        <p className="mt-1 text-sm text-gray-500">Use the rear camera to scan the member's QR code.</p>
                    </div>
                    <span className="text-2xl">📷</span>
                </div>
                <div id="sea-qr-reader" className="mt-4 min-h-8 overflow-hidden rounded-xl bg-gray-50" />
                {!scanning ? (
                    <button type="button" onClick={() => void startScanner()} disabled={loading}
                        className="mt-4 w-full rounded-xl bg-[#0C2340] px-4 py-3 font-bold text-white disabled:opacity-60">
                        Start Camera Scanner
                    </button>
                ) : (
                    <button type="button" onClick={() => void stopScanner()}
                        className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-[#0C2340]">
                        Stop Scanner
                    </button>
                )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="font-bold text-[#0C2340]">Manual ticket entry</h3>
                <p className="mt-1 text-sm text-gray-500">Use this if camera access is unavailable.</p>
                <form onSubmit={(event) => { event.preventDefault(); void checkIn(ticketCode); }} className="mt-3 space-y-3">
                    <input value={ticketCode} onChange={(event) => setTicketCode(event.target.value)}
                        placeholder="Paste ticket code" autoComplete="off"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-[#F15A24]" />
                    <button type="submit" disabled={loading || !ticketCode.trim()}
                        className="w-full rounded-xl bg-[#F15A24] px-4 py-3 font-bold text-white disabled:opacity-50">
                        {loading ? "Checking in..." : "Verify & Check In"}
                    </button>
                </form>
            </div>

            {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {result && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">Check-in successful</p>
                    <h3 className="mt-2 text-xl font-bold text-green-900">{result.attendeeName}</h3>
                    <p className="mt-1 text-sm text-green-800">{result.eventTitle}</p>
                    <p className="mt-2 text-xs text-green-700">Recorded {new Date(result.checkedInAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                </div>
            )}
        </section>
    );
}
