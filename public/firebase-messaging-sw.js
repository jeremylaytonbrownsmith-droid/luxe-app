/* Firebase Cloud Messaging service worker (background push).
 * Only active once you add real Firebase config in src/firebase.ts.
 * In demo mode this file is harmless and unused.
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// Paste the same config you put in your .env here to enable background push.
// (Service workers can't read import.meta.env, so this must be hard-coded for prod.)
const firebaseConfig = self.__LUXE_FIREBASE_CONFIG__ || null

if (firebaseConfig && firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()
  messaging.onBackgroundMessage((payload) => {
    const n = payload.notification || {}
    self.registration.showNotification(n.title || 'Local Luxe Concierge', {
      body: n.body || '',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      data: payload.data || {},
    })
  })
}
