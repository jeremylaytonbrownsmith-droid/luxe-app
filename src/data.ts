// Local data store for DEMO MODE.
//
// Persists to localStorage and notifies subscribers on change so the UI updates
// live (mimics Firestore's realtime listeners). When you wire real Firebase,
// replace the bodies of these functions with Firestore reads/writes — the
// component-facing API (the exported functions + useStore) can stay the same.

import { useSyncExternalStore } from 'react'
import type {
  AppNotification,
  CheckItem,
  ConciergeRequest,
  Photo,
  Property,
  User,
  Visit,
} from './types'

interface DB {
  users: User[]
  properties: Property[]
  visits: Visit[]
  requests: ConciergeRequest[]
  notifications: AppNotification[]
}

const STORAGE_KEY = 'luxe.db.v1'
const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString()

const STANDARD_CHECKLIST = (): CheckItem[] => [
  { key: 'exterior', label: 'Exterior & landscaping intact', ok: null },
  { key: 'doors', label: 'Doors & windows secure', ok: null },
  { key: 'hvac', label: 'HVAC running / thermostat set', ok: null },
  { key: 'plumbing', label: 'No leaks under sinks / water heater', ok: null },
  { key: 'pests', label: 'No signs of pests', ok: null },
  { key: 'electrical', label: 'Power on / no tripped breakers', ok: null },
  { key: 'mail', label: 'Mail & packages collected', ok: null },
  { key: 'pool', label: 'Pool / spa water level normal', ok: null },
]

function seed(): DB {
  const owner: User = {
    id: 'owner-1',
    name: 'Margaret Ellison',
    email: 'owner@demo.com',
    role: 'owner',
    propertyId: 'prop-1',
  }
  const operator: User = {
    id: 'op-1',
    name: 'Local Luxe Team',
    email: 'team@demo.com',
    role: 'operator',
  }
  const property: Property = {
    id: 'prop-1',
    ownerId: 'owner-1',
    ownerName: 'Margaret Ellison',
    address: '14 Wexford Club Dr',
    community: 'Wexford, Hilton Head Island',
    sizeTier: 'large',
    plan: 'weekly',
  }

  // One completed visit (so the owner has a report to view) + one upcoming.
  const completed: Visit = {
    id: 'visit-1',
    propertyId: 'prop-1',
    scheduledFor: daysFromNow(-5),
    status: 'completed',
    completedAt: daysFromNow(-5),
    summary:
      'All systems normal. Interior cool and dry, no leaks. Collected mail and two packages. Adjusted thermostat to 76°F per storm-season setting.',
    checklist: STANDARD_CHECKLIST().map((c) => ({
      ...c,
      ok: c.key === 'pool' ? false : true,
      note: c.key === 'pool' ? 'Water ~3" low — topped off and notified pool vendor.' : undefined,
    })),
    photos: [
      { id: uid(), caption: 'Front exterior — all clear', dataUrl: placeholder('#16477c', 'Exterior') },
      { id: uid(), caption: 'Kitchen — no leaks under sink', dataUrl: placeholder('#2e8b7a', 'Kitchen') },
      { id: uid(), caption: 'Thermostat set to 76°F', dataUrl: placeholder('#c5a74e', 'Thermostat') },
    ],
  }
  const upcoming: Visit = {
    id: 'visit-2',
    propertyId: 'prop-1',
    scheduledFor: daysFromNow(2),
    status: 'scheduled',
    checklist: STANDARD_CHECKLIST(),
    photos: [],
  }

  const request: ConciergeRequest = {
    id: 'req-1',
    propertyId: 'prop-1',
    ownerName: 'Margaret Ellison',
    category: 'Vendor coordination',
    details: 'Please have the pool vendor follow up on the low water level from the last visit.',
    status: 'acknowledged',
    createdAt: daysFromNow(-4),
  }

  return {
    users: [owner, operator],
    properties: [property],
    visits: [completed, upcoming],
    requests: [request],
    notifications: [],
  }
}

// Tiny inline SVG placeholder so the demo has "photos" with zero asset files.
function placeholder(color: string, label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
    <rect width='600' height='400' fill='${color}'/>
    <text x='300' y='205' font-family='Raleway,Arial' font-size='34' fill='rgba(255,255,255,0.9)'
      text-anchor='middle'>${label}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

let db: DB = load()
const listeners = new Set<() => void>()

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* ignore */
  }
  const fresh = seed()
  save(fresh)
  return fresh
}

function save(next: DB) {
  db = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// ---- Read API ----------------------------------------------------------------
export function getProperty(id?: string) {
  return db.properties.find((p) => p.id === id)
}
export function visitsForProperty(propertyId?: string) {
  return db.visits
    .filter((v) => v.propertyId === propertyId)
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor))
}
export function getVisit(id: string) {
  return db.visits.find((v) => v.id === id)
}
export function todaysQueue() {
  // For the operator: scheduled + in-progress visits, soonest first.
  return db.visits
    .filter((v) => v.status !== 'completed')
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
}
export function allRequests() {
  return [...db.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
export function requestsForProperty(propertyId?: string) {
  return allRequests().filter((r) => r.propertyId === propertyId)
}
export function notificationsFor(role: 'owner' | 'operator') {
  return db.notifications
    .filter((n) => n.to === role)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// ---- Write API ---------------------------------------------------------------
function pushNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  const note: AppNotification = { ...n, id: uid(), createdAt: now(), read: false }
  save({ ...db, notifications: [note, ...db.notifications] })
  return note
}

export function startVisit(id: string) {
  save({
    ...db,
    visits: db.visits.map((v) => (v.id === id ? { ...v, status: 'in-progress' } : v)),
  })
}

export function setCheckItem(visitId: string, key: string, ok: boolean, note?: string) {
  save({
    ...db,
    visits: db.visits.map((v) =>
      v.id === visitId
        ? { ...v, checklist: v.checklist.map((c) => (c.key === key ? { ...c, ok, note } : c)) }
        : v
    ),
  })
}

export function addPhoto(visitId: string, photo: Omit<Photo, 'id'>) {
  save({
    ...db,
    visits: db.visits.map((v) =>
      v.id === visitId ? { ...v, photos: [...v.photos, { ...photo, id: uid() }] } : v
    ),
  })
}

// Completing a visit publishes the report AND notifies the owner.
export function completeVisit(visitId: string, summary: string): AppNotification | null {
  const visit = db.visits.find((v) => v.id === visitId)
  if (!visit) return null
  save({
    ...db,
    visits: db.visits.map((v) =>
      v.id === visitId ? { ...v, status: 'completed', completedAt: now(), summary } : v
    ),
  })
  return pushNotification({
    to: 'owner',
    title: '✓ Your home was checked today',
    body: 'Your home watch report with photos is ready to view.',
    url: `/owner/report/${visitId}`,
  })
}

// Owners raise a concierge request -> operator gets notified.
export function createRequest(
  propertyId: string,
  ownerName: string,
  category: string,
  details: string
): AppNotification | null {
  const req: ConciergeRequest = {
    id: uid(),
    propertyId,
    ownerName,
    category,
    details,
    status: 'new',
    createdAt: now(),
  }
  save({ ...db, requests: [req, ...db.requests] })
  return pushNotification({
    to: 'operator',
    title: 'New concierge request',
    body: `${ownerName}: ${category}`,
    url: '/operator',
  })
}

export function setRequestStatus(id: string, status: ConciergeRequest['status']) {
  const req = db.requests.find((r) => r.id === id)
  save({
    ...db,
    requests: db.requests.map((r) => (r.id === id ? { ...r, status } : r)),
  })
  if (req && status !== 'new') {
    pushNotification({
      to: 'owner',
      title: 'Concierge request update',
      body: `"${req.category}" is now ${status}.`,
      url: '/owner',
    })
  }
}

export function markNotificationsRead(role: 'owner' | 'operator') {
  save({
    ...db,
    notifications: db.notifications.map((n) => (n.to === role ? { ...n, read: true } : n)),
  })
}

export function resetDemo() {
  const fresh = seed()
  save(fresh)
}

// ---- React binding -----------------------------------------------------------
// Components call useStore() so they re-render whenever the store changes.
export function useStore<T>(selector: () => T): T {
  return useSyncExternalStore(subscribe, selector, selector)
}
