// Service Worker for Push Notifications
// Listen for push events
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  // Ensure title and body are never empty
  const title = data.title || 'SpireTrack';
  const body = data.body || 'You have a new notification';
  
  const options = {
    body: body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    // Tag for grouping notifications of the same type
    tag: data.tag || 'spiretrack-notification',
    // Renotify so replacement notifications still alert user
    renotify: true,
    // Timestamp for proper ordering
    timestamp: Date.now(),
    data: {
      url: data.url || '/app',
      ...data.data
    },
    actions: data.actions || [
      { action: 'open', title: 'Open App' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/app';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url.includes('/app') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window if none found
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
