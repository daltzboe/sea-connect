"use client";

import { useEffect, useState } from "react";

type QrCode = {
    addData: (value: string) => void;
    make: () => void;
    createDataURL: (cellSize?: number, margin?: number) => string;
};

declare global {
    interface Window {
        qrcode?: (typeNumber: number, errorCorrectionLevel: string) => QrCode;
    }
}

const QR_SCRIPTS = [
    "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js",
    "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
];

function loadQrLibrary(): Promise<void> {
    if (window.qrcode) return Promise.resolve();

    return new Promise((resolve, reject) => {
        let index = 0;

        const tryNext = () => {
            if (window.qrcode) {
                resolve();
                return;
            }
            if (index >= QR_SCRIPTS.length) {
                reject(new Error("QR generator could not be loaded."));
                return;
            }

            const script = document.createElement("script");
            script.src = QR_SCRIPTS[index++];
            script.async = true;
            script.onload = () => {
                if (window.qrcode) resolve();
                else {
                    script.remove();
                    tryNext();
                }
            };
            script.onerror = () => {
                script.remove();
                tryNext();
            };
            document.head.appendChild(script);
        };

        tryNext();
    });
}

export default function EventTicketQr({ ticketCode }: { ticketCode: string }) {
    const [qrImage, setQrImage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setQrImage("");
        setError("");

        loadQrLibrary()
            .then(() => {
                if (cancelled || !window.qrcode) return;

                const qr = window.qrcode(0, "M");
                qr.addData(ticketCode);
                qr.make();
                const dataUrl = qr.createDataURL(8, 3);

                if (!cancelled) setQrImage(dataUrl);
            })
            .catch(() => {
                if (!cancelled) {
                    setError("QR display could not load. Please use the private ticket code below.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [ticketCode]);

    return (
        <div className="mx-auto flex max-w-sm flex-col items-center rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex min-h-[280px] min-w-[280px] items-center justify-center rounded-2xl border-4 border-[#0C2340] bg-white p-2">
                {qrImage ? (
                    // The QR is generated locally in this browser; the ticket code is not sent to a QR image service.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrImage} alt="Your event QR ticket" width={280} height={280} />
                ) : (
                    <p className="px-4 text-center text-xs text-gray-500">
                        {error || "Preparing your secure QR ticket…"}
                    </p>
                )}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Your private ticket code</p>
            <p className="mt-2 break-all rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm text-[#0C2340]">{ticketCode}</p>
            <p className="mt-3 text-center text-xs leading-5 text-gray-500">Keep this ticket private. Show it to an SEAConnect officer at the event entrance.</p>
        </div>
    );
}
