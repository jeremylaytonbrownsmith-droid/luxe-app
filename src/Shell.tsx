// Shared responsive dashboard shell used by BOTH the Pro and Homeowner apps,
// so the whole product has one consistent look (sidebar + header + content)
// that works on phone, tablet, and desktop.

import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { markNotificationsRead, notificationsFor, useStore } from './data'
import { registerServiceWorker } from './notifications'
import { timeAgo } from './components'
import { BRAND_LOGO } from './brand'
import { Icon } from './icons'
import type { Role } from './types'

type IconName = Parameters<typeof Icon>[0]['name']
export interface NavItem {
  to: string
  end?: boolean
  ic: IconName
  label: string
}

const PRO_NAV: NavItem[] = [
  { to: '/pro', end: true, ic: 'home', label: 'Home' },
  { to: '/pro/clients', ic: 'clients', label: 'Clients' },
  { to: '/pro/properties', ic: 'properties', label: 'Properties' },
  { to: '/pro/experts', ic: 'experts', label: 'Experts' },
  { to: '/pro/visits', ic: 'homewatch', label: 'Home Watch' },
  { to: '/pro/requests', ic: 'concierge', label: 'Requests' },
  { to: '/pro/settings', ic: 'settings', label: 'Settings' },
]

const OWNER_NAV: NavItem[] = [
  { to: '/owner', end: true, ic: 'home', label: 'Home' },
  { to: '/owner/visits', ic: 'reports', label: 'Reports' },
  { to: '/owner/documents', ic: 'document', label: 'Documents' },
  { to: '/owner/experts', ic: 'experts', label: 'Experts' },
  { to: '/owner/request', ic: 'concierge', label: 'Concierge' },
  { to: '/owner/account', ic: 'account', label: 'Account' },
]

function Shell({
  nav,
  role,
  brandSub,
  title,
  subtitle,
  actions,
  children,
}: {
  nav: NavItem[]
  role: Role
  brandSub: string
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bell, setBell] = useState(false)
  const unread = useStore(() => notificationsFor(role).filter((n) => !n.read).length)

  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <div className="pro">
      <aside className="pro-sidebar">
        <div className="pro-logo">
          <img className="pro-logo-img" src={BRAND_LOGO} alt="Local Luxe Concierge" />
          <div className="s" style={{ marginTop: 4 }}>{brandSub}</div>
        </div>
        <nav className="pro-nav">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ic"><Icon name={n.ic} size={19} /></span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="foot">
          <button onClick={logout} title="Sign out" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="logout" size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="pro-main fade-in">
        <header className="pro-head">
          <div>
            <h1>{title}</h1>
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          <div className="pro-head-actions">
            {actions}
            <button className="pro-bell icon-btn" onClick={() => setBell((b) => !b)} aria-label="Notifications">
              <Icon name="bell" size={20} />
              {unread > 0 && <span className="badge">{unread}</span>}
            </button>
            <div className="pro-avatar" style={{ background: '#2f5167', color: '#cfe0d6', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
              {user?.name?.[0] ?? 'L'}
            </div>
          </div>
        </header>

        {bell && <Notifications role={role} onClose={() => setBell(false)} onGo={(u) => { setBell(false); navigate(u) }} />}
        {children}
      </main>
    </div>
  )
}

function Notifications({ role, onClose, onGo }: { role: Role; onClose: () => void; onGo: (u: string) => void }) {
  const items = useStore(() => notificationsFor(role))
  useEffect(() => {
    markNotificationsRead(role)
  }, [role])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="pcard fade-in"
        style={{ position: 'absolute', top: 70, right: 30, width: 340, maxWidth: '90vw', boxShadow: '0 16px 40px rgba(20,40,70,0.18)' }}
      >
        <div className="row" style={{ marginBottom: 10 }}>
          <strong>Notifications</strong>
          <button className="pbtn ghost sm" onClick={onClose}>Close</button>
        </div>
        {items.length === 0 && <p className="p-muted" style={{ fontSize: 13 }}>No notifications yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((n) => (
            <div key={n.id} onClick={() => onGo(n.url)} style={{ cursor: 'pointer', padding: '10px 12px', border: '1px solid var(--p-line)', borderRadius: 10 }}>
              <div className="row">
                <strong style={{ fontSize: 13 }}>{n.title}</strong>
                <span className="p-muted" style={{ fontSize: 11 }}>{timeAgo(n.createdAt)}</span>
              </div>
              <div className="p-muted" style={{ fontSize: 12, marginTop: 3 }}>{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProLayout(props: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return <Shell nav={PRO_NAV} role="pro" brandSub="PRO PORTAL" {...props} />
}

export function OwnerLayout(props: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return <Shell nav={OWNER_NAV} role="owner" brandSub="HOME PORTAL" {...props} />
}
