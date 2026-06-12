// Notification helpers. Registers the service worker, requests permission,
// and pops a real system notification. In demo mode this uses the local
// service worker (Notification API). In production the same SW also receives
// Firebase Cloud Messaging pushes for true cross-device delivery.

let swReg: ServiceWorkerRegistration | null = null

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    swReg = await navigator.serviceWorker.register('/sw.js')
  } catch (e) {
    console.warn('SW registration failed', e)
  }
}

export function notificationPermission(): NotificationPermission {
  return 'Notification' in window ? Notification.permission : 'denied'
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

interface PushArgs {
  title: string
  body: string
  url?: string
  tag?: string
}

// Fire a system notification via the service worker (works installed/standalone).
export async function pushLocal({ title, body, url = '/', tag }: PushArgs): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const reg = swReg || (await navigator.serviceWorker.ready)
  if (reg?.active) {
    reg.active.postMessage({ type: 'notify', title, body, url, tag })
  } else {
    // Fallback when SW isn't controlling yet.
    new Notification(title, { body, icon: '/icons/icon.svg' })
  }
}
