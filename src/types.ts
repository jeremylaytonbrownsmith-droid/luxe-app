// Shared domain types for Local Luxe Concierge.

export type Role = 'owner' | 'operator'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  propertyId?: string // owners are tied to a property
}

export interface Property {
  id: string
  ownerId: string
  ownerName: string
  address: string
  community: string
  sizeTier: 'condo' | 'mid' | 'large' // matches pricing tiers on the website
  plan: 'weekly' | 'bi-monthly' | 'monthly'
}

export type VisitStatus = 'scheduled' | 'in-progress' | 'completed'

// One checklist item captured during a home-watch inspection.
export interface CheckItem {
  key: string
  label: string
  ok: boolean | null // null = not yet checked
  note?: string
}

export interface Photo {
  id: string
  caption: string
  dataUrl: string // in demo we store data URLs; in prod these are Storage URLs
}

export interface Visit {
  id: string
  propertyId: string
  scheduledFor: string // ISO date
  status: VisitStatus
  checklist: CheckItem[]
  photos: Photo[]
  summary?: string
  completedAt?: string
}

export type RequestStatus = 'new' | 'acknowledged' | 'scheduled' | 'done'

// A concierge add-on request raised by an owner.
export interface ConciergeRequest {
  id: string
  propertyId: string
  ownerName: string
  category: string
  details: string
  status: RequestStatus
  createdAt: string
}

export interface AppNotification {
  id: string
  to: Role
  title: string
  body: string
  url: string
  createdAt: string
  read: boolean
}
