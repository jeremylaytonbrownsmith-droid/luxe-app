// Firebase initialization with graceful DEMO-MODE fallback.
//
// If the VITE_FIREBASE_* env vars are present, we boot a real Firebase app.
// If they're blank (the default), `isDemo` is true and the app runs entirely
// on the local seeded data layer — no network, fully presentable.

import { initializeApp, type FirebaseApp } from 'firebase/app'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined

export const isDemo = !cfg.apiKey || !cfg.projectId

export const firebaseConfig = cfg

let app: FirebaseApp | null = null
if (!isDemo) {
  app = initializeApp(cfg as Record<string, string>)
}

export { app }
