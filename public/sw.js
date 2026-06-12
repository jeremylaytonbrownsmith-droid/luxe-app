/* Local Luxe Concierge — app service worker
 * Handles: (1) a tiny offline cache for the shell, and
 *          (2) showing notifications dispatched from the page (demo + FCM foreground).
 */
// Paths are relative to the service worker's scope, so this works both at the
// site root (local dev) and under a subpath like /luxe-app/ (GitHub Pages).
const CACHE = 'luxe-shell-v2'
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Network-first for navigations (always fresh in dev), cache fallback when offline.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html').then((r) => r || fetch(request)))
    )
  }
})

// The page posts {type:'notify', title, body, url} to trigger a system notification.
self.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data.type === 'notify') {
    self.registration.showNotification(data.title || 'Local Luxe Concierge', {
      body: data.body || '',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: data.tag || 'luxe',
      data: { url: data.url || '/' },
      vibrate: [80, 40, 80],
    })
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  // Open/focus the app at its scope root (works under any base path + hash routing).
  const home = self.registration.scope
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow(home)
    })
  )
})
