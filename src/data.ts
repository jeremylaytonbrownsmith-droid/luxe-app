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
  Client,
  ConciergeRequest,
  Expert,
  Photo,
  Property,
  PropertyDoc,
  Role,
  User,
  Visit,
} from './types'

interface DB {
  users: User[]
  clients: Client[]
  experts: Expert[]
  properties: Property[]
  visits: Visit[]
  requests: ConciergeRequest[]
  notifications: AppNotification[]
}

const STORAGE_KEY = 'luxe.db.v2'
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

// Tiny inline SVG placeholder so the demo has imagery with zero asset files.
function ph(color: string, label: string, w = 600, h = 400): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <rect width='${w}' height='${h}' fill='${color}'/>
    <text x='50%' y='52%' font-family='Raleway,Arial' font-size='30' fill='rgba(255,255,255,0.92)'
      text-anchor='middle'>${label}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

function seed(): DB {
  const pro: User = { id: 'pro-1', name: 'Local Luxe Team', email: 'team@demo.com', role: 'pro' }
  const owner: User = {
    id: 'owner-1',
    name: 'Margaret Ellison',
    email: 'owner@demo.com',
    role: 'owner',
    propertyId: 'prop-1',
  }

  const experts: Expert[] = [
    {
      id: 'exp-1',
      company: 'Lowcountry Electric Co.',
      website: 'lowcountryelectric.com',
      email: 'service@lowcountryelectric.com',
      phone: '(843) 555-0142',
      description:
        'Trusted, licensed electrical services across the Lowcountry. Over 15 years serving Bluffton & Hilton Head — from generator hookups to surge protection for storm season.',
      logoUrl: ph('#1d4e6b', 'LEC', 200, 200),
      serviceArea: 'Bluffton / Hilton Head, SC',
      categories: ['Electrician', 'Appliance Repair', 'Handyman'],
    },
    {
      id: 'exp-2',
      company: 'Palmetto Pest Control',
      website: 'palmettopest.com',
      email: 'hello@palmettopest.com',
      phone: '(843) 555-0177',
      description:
        'Coastal pest & termite specialists. Quarterly treatments and rapid response for second homes.',
      logoUrl: ph('#2e8b7a', 'PPC', 200, 200),
      serviceArea: 'Beaufort County, SC',
      categories: ['Pest Control', 'Cleaners'],
    },
    {
      id: 'exp-3',
      company: 'Hilton Head Roofing & Restoration',
      website: 'hhroofing.com',
      email: 'info@hhroofing.com',
      phone: '(843) 555-0109',
      description:
        'Roofing, foundation, and exterior cleaning. Hurricane-prep inspections and post-storm restoration.',
      logoUrl: ph('#b5a808', 'HHR', 200, 200),
      serviceArea: 'Hilton Head Island, SC',
      categories: ['Roofing', 'Exterior Cleaning', 'Hurricane Prep'],
    },
    {
      id: 'exp-4',
      company: 'May River Pool & Spa',
      website: 'mayriverpool.com',
      email: 'service@mayriverpool.com',
      phone: '(843) 555-0188',
      description: 'Pool & spa maintenance, repair, and seasonal opening/closing for away homeowners.',
      logoUrl: ph('#16477c', 'MRP', 200, 200),
      serviceArea: 'Bluffton, SC',
      categories: ['Pool & Spa', 'Landscaping'],
    },
  ]

  const docsP1: PropertyDoc[] = [
    { id: 'doc-1', name: 'Homeowner’s Insurance Policy 2026', kind: 'pdf' },
    { id: 'doc-2', name: 'HVAC Service Records', kind: 'pdf' },
    { id: 'doc-3', name: 'Gate & Alarm Codes', kind: 'pdf' },
  ]

  const properties: Property[] = [
    {
      id: 'prop-1',
      name: 'Wexford Waterfront',
      address: '14 Wexford Club Dr',
      community: 'Wexford, Hilton Head Island',
      beds: 5,
      baths: 4.5,
      yearBuilt: 2017,
      sqft: 4600,
      salePrice: 1675000,
      photoUrl: ph('#1d4e6b', 'Wexford Waterfront'),
      status: 'active',
      documents: docsP1,
      sizeTier: 'large',
      plan: 'weekly',
      clientId: 'client-1',
      sharedDocIds: ['doc-1', 'doc-3'],
      sharedExpertIds: ['exp-1', 'exp-2', 'exp-4'],
    },
    {
      id: 'prop-2',
      name: 'Palmetto Bluff Cottage',
      address: '32 Boundary St',
      community: 'Palmetto Bluff, Bluffton',
      beds: 3,
      baths: 3,
      yearBuilt: 2020,
      sqft: 2400,
      salePrice: 985000,
      photoUrl: ph('#2e8b7a', 'Palmetto Bluff Cottage'),
      status: 'active',
      documents: [],
      sizeTier: 'mid',
      plan: 'bi-monthly',
      clientId: 'client-2',
      sharedDocIds: [],
      sharedExpertIds: ['exp-1'],
    },
    {
      id: 'prop-3',
      name: 'Sea Pines Retreat',
      address: '8 Lagoon Rd',
      community: 'Sea Pines, Hilton Head Island',
      beds: 4,
      baths: 3.5,
      yearBuilt: 2015,
      sqft: 3200,
      salePrice: 1290000,
      photoUrl: ph('#16477c', 'Sea Pines Retreat'),
      status: 'pending',
      documents: [],
      sizeTier: 'large',
      plan: 'monthly',
      sharedDocIds: [],
      sharedExpertIds: [],
    },
  ]

  const clients: Client[] = [
    {
      id: 'client-1',
      firstName: 'Margaret',
      lastName: 'Ellison',
      phone: '(843) 555-0123',
      email: 'owner@demo.com',
      photoUrl: ph('#1d4e6b', 'ME', 120, 120),
      birthday: '1962-04-18',
      anniversary: '1988-06-11',
      propertyId: 'prop-1',
      inviteStatus: 'accepted',
      updatedAt: daysFromNow(-2),
    },
    {
      id: 'client-2',
      firstName: 'Charles',
      lastName: 'Whitmore',
      phone: '(843) 555-0145',
      email: 'cwhitmore@example.com',
      photoUrl: ph('#2e8b7a', 'CW', 120, 120),
      propertyId: 'prop-2',
      inviteStatus: 'invited',
      updatedAt: daysFromNow(-1),
    },
    {
      id: 'client-3',
      firstName: 'Diane',
      lastName: 'Foster',
      phone: '(843) 555-0167',
      email: 'dfoster@example.com',
      inviteStatus: 'unassigned',
      updatedAt: daysFromNow(-6),
    },
  ]

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
      { id: uid(), caption: 'Front exterior — all clear', dataUrl: ph('#16477c', 'Exterior') },
      { id: uid(), caption: 'Kitchen — no leaks under sink', dataUrl: ph('#2e8b7a', 'Kitchen') },
      { id: uid(), caption: 'Thermostat set to 76°F', dataUrl: ph('#b5a808', 'Thermostat') },
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
  const upcoming2: Visit = {
    id: 'visit-3',
    propertyId: 'prop-2',
    scheduledFor: daysFromNow(1),
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
    users: [pro, owner],
    clients,
    experts,
    properties,
    visits: [completed, upcoming, upcoming2],
    requests: [request],
    notifications: [],
  }
}

// Declared before `db` so there's no temporal-dead-zone error when the initial
// load runs at module evaluation.
const listeners = new Set<() => void>()
let version = 0
let db: DB = initialLoad()

// Note: does NOT call save() — that would touch `db`/`listeners` while they're
// still being initialized. It just returns the starting state.
function initialLoad(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* ignore */
  }
  const fresh = seed()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  } catch {
    /* ignore */
  }
  return fresh
}

function save(next: DB) {
  db = next
  version++
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

// ---- Reads -----------------------------------------------------------------
export const getClients = () => [...db.clients].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
export const getClient = (id?: string) => db.clients.find((c) => c.id === id)
export const getExperts = () => db.experts
export const getExpert = (id?: string) => db.experts.find((e) => e.id === id)
export const getProperties = () => db.properties
export const getProperty = (id?: string) => db.properties.find((p) => p.id === id)
export const expertsByIds = (ids: string[]) => db.experts.filter((e) => ids.includes(e.id))

export function visitsForProperty(propertyId?: string) {
  return db.visits
    .filter((v) => v.propertyId === propertyId)
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor))
}
export const getVisit = (id: string) => db.visits.find((v) => v.id === id)
export function upcomingVisits() {
  return db.visits
    .filter((v) => v.status !== 'completed')
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
}
export const allRequests = () =>
  [...db.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
export const requestsForProperty = (propertyId?: string) =>
  allRequests().filter((r) => r.propertyId === propertyId)
export const notificationsFor = (role: Role) =>
  db.notifications.filter((n) => n.to === role).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

// Dashboard rollups
export const stats = () => ({
  clients: db.clients.length,
  properties: db.properties.length,
  upcomingVisits: db.visits.filter((v) => v.status !== 'completed').length,
  openRequests: db.requests.filter((r) => r.status !== 'done').length,
})

// ---- Writes ----------------------------------------------------------------
function pushNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  const note: AppNotification = { ...n, id: uid(), createdAt: now(), read: false }
  save({ ...db, notifications: [note, ...db.notifications] })
  return note
}

// Clients
export function upsertClient(input: Omit<Client, 'id' | 'updatedAt' | 'inviteStatus'> & { id?: string }) {
  const existing = input.id ? db.clients.find((c) => c.id === input.id) : undefined
  const client: Client = {
    id: input.id || uid(),
    inviteStatus: existing?.inviteStatus || 'unassigned',
    updatedAt: now(),
    ...input,
  }
  const clients = existing
    ? db.clients.map((c) => (c.id === client.id ? client : c))
    : [client, ...db.clients]
  save({ ...db, clients })
  return client
}

// Experts
export function upsertExpert(input: Omit<Expert, 'id'> & { id?: string }) {
  const existing = input.id ? db.experts.find((e) => e.id === input.id) : undefined
  const expert: Expert = { id: input.id || uid(), ...input }
  const experts = existing
    ? db.experts.map((e) => (e.id === expert.id ? expert : e))
    : [...db.experts, expert]
  save({ ...db, experts })
  return expert
}
export function deleteExpert(id: string) {
  save({ ...db, experts: db.experts.filter((e) => e.id !== id) })
}

// Properties
export function upsertProperty(
  input: Omit<Property, 'id' | 'documents' | 'sharedDocIds' | 'sharedExpertIds'> & {
    id?: string
    documents?: PropertyDoc[]
  }
) {
  const existing = input.id ? db.properties.find((p) => p.id === input.id) : undefined
  const property: Property = {
    id: input.id || uid(),
    documents: input.documents ?? existing?.documents ?? [],
    sharedDocIds: existing?.sharedDocIds ?? [],
    sharedExpertIds: existing?.sharedExpertIds ?? [],
    ...input,
  }
  const properties = existing
    ? db.properties.map((p) => (p.id === property.id ? property : p))
    : [property, ...db.properties]
  save({ ...db, properties })
  return property
}
export function addPropertyDoc(propertyId: string, name: string, kind: 'pdf' | 'image') {
  save({
    ...db,
    properties: db.properties.map((p) =>
      p.id === propertyId
        ? { ...p, documents: [...p.documents, { id: uid(), name, kind }] }
        : p
    ),
  })
}
export function setPropertyStatus(propertyId: string, status: Property['status']) {
  save({
    ...db,
    properties: db.properties.map((p) => (p.id === propertyId ? { ...p, status } : p)),
  })
}

// The HomeLedger-style invite: link a client, share docs + experts, notify owner.
export function inviteClient(args: {
  propertyId: string
  clientId: string
  salePrice?: number
  sharedDocIds: string[]
  sharedExpertIds: string[]
}) {
  const client = db.clients.find((c) => c.id === args.clientId)
  save({
    ...db,
    properties: db.properties.map((p) =>
      p.id === args.propertyId
        ? {
            ...p,
            clientId: args.clientId,
            salePrice: args.salePrice ?? p.salePrice,
            sharedDocIds: args.sharedDocIds,
            sharedExpertIds: args.sharedExpertIds,
          }
        : p
    ),
    clients: db.clients.map((c) =>
      c.id === args.clientId
        ? { ...c, propertyId: args.propertyId, inviteStatus: 'invited', updatedAt: now() }
        : c
    ),
  })
  return client
}

// Home watch
export function startVisit(id: string) {
  save({ ...db, visits: db.visits.map((v) => (v.id === id ? { ...v, status: 'in-progress' } : v)) })
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
export function completeVisit(visitId: string, summary: string) {
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

// Concierge requests
export function createRequest(propertyId: string, ownerName: string, category: string, details: string) {
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
    to: 'pro',
    title: 'New concierge request',
    body: `${ownerName}: ${category}`,
    url: '/pro/requests',
  })
}
export function setRequestStatus(id: string, status: ConciergeRequest['status']) {
  const req = db.requests.find((r) => r.id === id)
  save({ ...db, requests: db.requests.map((r) => (r.id === id ? { ...r, status } : r)) })
  if (req && status !== 'new') {
    pushNotification({
      to: 'owner',
      title: 'Concierge request update',
      body: `"${req.category}" is now ${status}.`,
      url: '/owner',
    })
  }
}

export function markNotificationsRead(role: Role) {
  save({
    ...db,
    notifications: db.notifications.map((n) => (n.to === role ? { ...n, read: true } : n)),
  })
}

export function resetDemo() {
  save(seed())
}

// ---- React binding ---------------------------------------------------------
// The external snapshot is a stable version number (so useSyncExternalStore
// never loops), and we recompute the selector on each render after subscribing.
export function useStore<T>(selector: () => T): T {
  useSyncExternalStore(subscribe, () => version, () => version)
  return selector()
}
