import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "SEAConnect",
        short_name: "SEAConnect",
        description:
            "The digital hub for Students of East Africa at UTSA.",
        start_url: "/",
        display: "standalone",
        background_color: "#071522",
        theme_color: "#0C2340",
        orientation: "portrait",
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}