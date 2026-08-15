const CACHE_NAME = "seaconnect-v1";

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

/* ================================
   PUSH NOTIFICATIONS
================================ */

self.addEventListener("push", (event) => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();

    const title = data.title || "SEAConnect";

    const options = {
        body: data.body || "You have a new notification.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: {
            url: data.url || "/notifications",
        },
        vibrate: [200, 100, 200],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

/* ================================
   NOTIFICATION CLICK
================================ */

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url =
        event.notification.data?.url ||
        "/notifications";

    event.waitUntil(
        self.clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((clientList) => {

                for (const client of clientList) {
                    if ("focus" in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }

                if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                }
            })
    );
});