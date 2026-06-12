// Firebase initialization.
//
// The web config below is safe to commit (it's public by design — Firebase
// security is enforced by Auth + security rules, not by hiding these values).
//
// BACKEND_READY gates the cutover from demo data to the real Firebase backend.
// It stays false until Auth + Firestore are wired in (Day 1), so the app keeps
// running on seeded demo data until the live backend is ready and tested.

import { initializeApp, type FirebaseApp } from 'firebase/app'

export const firebaseConfig = {
  apiKey: 'AIzaSyBii95bnterdZzfWFJbjv0jMJpA8xR34UI',
  authDomain: 'luxe-app-9c7af.firebaseapp.com',
  projectId: 'luxe-app-9c7af',
  storageBucket: 'luxe-app-9c7af.firebasestorage.app',
  messagingSenderId: '630730180548',
  appId: '1:630730180548:web:a358ee0e6b11badc7f4691',
}

// Flip to true once the real Auth/Firestore code paths are in place.
export const BACKEND_READY = false
export const isDemo = !BACKEND_READY

// Web Push (FCM) key — set via env when we wire push on Day 2.
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined

// Initialize now so the plumbing is ready; harmless while we're still on demo data.
export const app: FirebaseApp = initializeApp(firebaseConfig)
