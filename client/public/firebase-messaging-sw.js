// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-BsQ5SGdOFfZycKJSekZ6VrVskGVIuJg",
  authDomain: "campus-connects-49a93.firebaseapp.com",
  projectId: "campus-connects-49a93",
  storageBucket: "campus-connects-49a93.firebasestorage.app",
  messagingSenderId: "454794694447",
  appId: "1:454794694447:web:af09561203b3941c575bda"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Campus Connect';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification',
    icon: payload.notification?.icon || payload.data?.icon || '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    image: payload.notification?.image || payload.data?.image,
    data: {
      url: payload.data?.clickAction || payload.fcmOptions?.link || '/',
      ...payload.data
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.type || 'notification',
    requireInteraction: payload.data?.requireInteraction === 'true',
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icons/icon-96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96.png'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Handle action buttons
  if (event.action === 'close') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: urlToOpen,
            data: event.notification.data
          });
          return client;
        }
      }

      // No window open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push event (for custom handling)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  // Firebase messaging handles this automatically,
  // but you can add custom logic here if needed
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installing...');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  console.log('[firebase-messaging-sw.js] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
