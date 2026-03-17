// public/sw.js
// ─────────────────────────────────────────────────────────────
// Service Worker — handles incoming push events and shows
// browser notifications. Must be at the ROOT of your domain.
// Place this file in /public/sw.js (Vite copies public/ to dist/)
// ─────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// ── Receive push and show notification ───────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'ChoreQuest 🏆', body: event.data.text() }
  }

  const { title, body, icon, badge, tag, url, actions } = data

  const options = {
    body:    body    || 'You have a new notification',
    icon:    icon    || '/icon-192.png',
    badge:   badge   || '/badge-72.png',
    tag:     tag     || 'chorequest',
    data:    { url: url || '/' },
    actions: actions || [],
    vibrate: [200, 100, 200],
    requireInteraction: false,
  }

  event.waitUntil(
    self.registration.showNotification(title || 'ChoreQuest 🏆', options)
  )
})

// ── Notification click — open or focus the app ───────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          return
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
