"use client";

import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        QRCode?: {
            toCanvas: (
                canvas: HTMLCanvasElement,
                text: string,
                options: { width: number; margin: number; errorCorrectionLevel: string },
                callback: (error: Error | null) => void
            ) => void;
        };
    }
}

const QR_SCRIPT = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js";

function loadQrLibrary() {
    return new Promise<void>((resolve, reject) => {
        if (window.QRCode) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${QR_SCRIPT}"]`);
        if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Could not load QR display.")), { once: true });
            if (window.QRCode) resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = QR_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load QR display."));
        document.head.appendChild(script);
    });
}

export default function EventTicketQr({ ticketCode }: { ticketCode: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        loadQrLibrary()
            .then(() => {
                if (cancelled || !canvasRef.current || !window.QRCode) return;
                window.QRCode.toCanvas(
                    canvasRef.current,
                    ticketCode,
                    { width: 280, margin: 2, errorCorrectionLevel: "M" },
                    (qrError) => {
                        if (qrError && !cancelled) setError("Unable to render your QR code. You can use the ticket code below.");
                    }
                );
            })
            .catch(() => {
                if (!cancelled) setError("Unable to load the QR display. You can use the ticket code below.");
            });
        return () => { cancelled = true; };
    }, [ticketCode]);

    return (
        <div className="mx-auto flex max-w-sm flex-col items-center rounded-2xl bg-white p-5 shadow-sm">
            <div className="rounded-2xl border-4 border-[#0C2340] bg-white p-2">
                <canvas ref={canvasRef} aria-label="Your event QR ticket" />
            </div>
            {error && <p className="mt-3 text-center text-xs text-amber-700">{error}</p>}
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Your private ticket code</p>
            <p className="mt-2 break-all rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm text-[#0C2340]">{ticketCode}</p>
            <p className="mt-3 text-center text-xs leading-5 text-gray-500">Keep this ticket private. Show it to an SEAConnect officer at the event entrance.</p>
        </div>
    );
}
