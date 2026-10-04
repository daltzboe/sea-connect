const CACHE_NAME = "seaconnect-v1";

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }

                return response;
            })
            .catch(() => {
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

    let data;

    try {
        data = event.data.json();
    } catch {
        data = {
            title: "SEAConnect",
            body: event.data.text(),
        };
    }

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

                return self.clients.openWindow(url);
            })
    );
});