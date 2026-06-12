# Local Luxe Concierge — App (PWA)

A Progressive Web App for **Local Luxe Concierge** (home watch + concierge for
second homes in Bluffton / Hilton Head / Beaufort, SC). Two experiences in one
installable app:

- **Homeowner** — view home watch reports with photos, track the next visit, and
  send concierge requests. Gets a push the moment a report is ready.
- **Concierge Team (operator)** — work today's visit queue, complete an on-site
  inspection checklist, add photos, submit the report (which **notifies the
  owner**), and manage concierge requests.

The headline feature is the **two-way notification loop**:
`visit → report → owner notified` and `owner request → team notified`.

## Run it (demo mode — no backend needed)

```bash
npm install
npm run dev
```

Open the printed URL. On the login splash, tap **Enter as Homeowner** or
**Enter as Concierge Team**. The app runs on seeded sample data stored in your
browser, so it's fully clickable for presenting.

### See the notifications work
1. Tap **Enable** on the notification banner (grant permission).
2. Enter as the **Concierge Team**, open a scheduled visit, check the items, add
   a photo, and tap **Complete & notify owner** → a real system notification fires.
3. As the **Homeowner**, send a concierge request → the team gets notified; the
   bell badge updates live.

> Tip: open two browser windows (one homeowner, one team) to demo both sides. The
> data layer is shared via the browser, so updates appear live in both.

## Install as an app
In Chrome/Edge (desktop or Android) use **Install app** from the address bar /
menu. On iOS Safari use **Share → Add to Home Screen**. It launches full-screen
with its own icon.

## Going live with Firebase

The app ships in **demo mode** and flips to real Firebase automatically once you
provide config:

1. Create a Firebase project; add a **Web app**.
2. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values
   (and the Web Push `VITE_FIREBASE_VAPID_KEY` for Cloud Messaging).
3. Replace the demo bodies in `src/data.ts` with Firestore reads/writes and
   `src/auth.tsx` with Firebase Auth. The component-facing APIs are designed to
   stay the same, so the UI doesn't change.
4. For background push, hard-code your config into
   `public/firebase-messaging-sw.js` (service workers can't read `.env`).

Storage is the natural home for inspection photos (the demo uses inline data
URLs). FCM delivers the cross-device push that the local service worker
demonstrates today.

## Project structure

```
public/            manifest, icons, service workers (app SW + FCM SW)
src/
  data.ts          demo data store (localStorage + live subscribe) — swap for Firestore
  auth.tsx         demo auth (role picker) — swap for Firebase Auth
  firebase.ts      Firebase init + demo-mode detection
  notifications.ts service-worker registration + push helpers
  components.tsx   shared UI (top bar, nav, notifications sheet, toast)
  pages/           owner + operator screens
```

## Stack
React + TypeScript + Vite, Firebase (Auth / Firestore / Storage / FCM),
PWA (manifest + service worker). Brand colors & fonts match the Local Luxe website.
