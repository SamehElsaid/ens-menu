importScripts(
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js",
);

self.addEventListener("install", () => {
  console.log("[SW] Firebase messaging service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Firebase messaging service worker activated");
  event.waitUntil(self.clients.claim());
});

const firebaseConfig = {
  apiKey: "AIzaSyCz7GcfG1X3mZjCCX7Er1K6MA_o8mLiCe8",
  authDomain: "ens-staff.firebaseapp.com",
  projectId: "ens-staff",
  storageBucket: "ens-staff.firebasestorage.app",
  messagingSenderId: "1021433211661",
  appId: "1:1021433211661:web:032b75c20714c889109e44",
  measurementId: "G-GGMTF0WRSR",
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.message ||
      "You have a new notification",
    icon: "/imgs/logo.svg",
    badge: "/imgs/logo.svg",
    data: payload.data,
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Close" },
    ],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);
  event.notification.close();

  if (event.action === "open") {
    const urlToOpen = event.notification.data?.url ?? "/";
    event.waitUntil(self.clients.openWindow(urlToOpen));
  } else {
    const data = event.notification.data || {};
    const targetUrl =
      typeof data.url === "string" && data.url.trim()
        ? data.url.trim()
        : null;
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        if (targetUrl) {
          return self.clients.openWindow(targetUrl);
        }
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              data: event.notification.data,
            });
            return;
          }
        }
        return self.clients.openWindow("/");
      }),
    );
  }
});

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event);
});
