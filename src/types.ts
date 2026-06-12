// Shared domain types for Local Luxe Concierge.

export type Role = 'owner' | 'pro'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  propertyId?: string // owners are tied to a property
}

// ---- People ----------------------------------------------------------------
export type InviteStatus = 'unassigned' | 'invited' | 'accepted' | 'declined'

export interface Client {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  photoUrl?: string
  birthday?: string
  anniversary?: string
  propertyId?: string
  inviteStatus: InviteStatus
  updatedAt: string
}

// ---- Vetted vendors --------------------------------------------------------
export const SERVICE_CATEGORIES = [
  'Electrician',
  'Plumber',
  'HVAC',
  'Roofing',
  'Pest Control',
  'Landscaping',
  'Pool & Spa',
  'Cleaners',
  'Handyman',
  'General Contractor',
  'Painting',
  'Appliance Repair',
  'Exterior Cleaning',
  'Hurricane Prep',
  'Other',
] as const
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export interface Expert {
  id: string
  company: string
  website?: string
  email: string
  phone: string
  description: string
  logoUrl?: string
  serviceArea: string
  categories: ServiceCategory[]
}

// ---- Properties ------------------------------------------------------------
export type PropertyStatus = 'active' | 'pending' | 'sold'
export type Plan = 'weekly' | 'bi-monthly' | 'monthly'

export interface PropertyDoc {
  id: string
  name: string
  kind: 'pdf' | 'image'
}

export interface Property {
  id: string
  name: string
  address: string
  community: string
  beds: number
  baths: number
  yearBuilt: number
  sqft: number
  salePrice?: number
  photoUrl?: string
  status: PropertyStatus
  documents: PropertyDoc[]
  // Home-watch service config
  sizeTier: 'condo' | 'mid' | 'large'
  plan: Plan
  // Linkage + sharing (the HomeLedger-style invite)
  clientId?: string
  sharedDocIds: string[]
  sharedExpertIds: string[]
}

// ---- Home watch ------------------------------------------------------------
export type VisitStatus = 'scheduled' | 'in-progress' | 'completed'

export interface CheckItem {
  key: string
  label: string
  ok: boolean | null
  note?: string
}

export interface Photo {
  id: string
  caption: string
  dataUrl: string
}

export interface Visit {
  id: string
  propertyId: string
  scheduledFor: string
  status: VisitStatus
  checklist: CheckItem[]
  photos: Photo[]
  summary?: string
  completedAt?: string
}

// ---- Concierge requests ----------------------------------------------------
export type RequestStatus = 'new' | 'acknowledged' | 'scheduled' | 'done'

export interface ConciergeRequest {
  id: string
  propertyId: string
  ownerName: string
  category: string
  details: string
  status: RequestStatus
  createdAt: string
}

// ---- Notifications ---------------------------------------------------------
export interface AppNotification {
  id: string
  to: Role
  title: string
  body: string
  url: string
  createdAt: string
  read: boolean
}
