import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { markNotificationsRead, notificationsFor, useStore } from '../data'
import { registerServiceWorker } from '../notifications'
import { timeAgo } from '../components'
import { BRAND_LOGO } from '../brand'
import { Icon } from '../icons'

const NAV = [
  { to: '/pro', end: true, ic: 'home', label: 'Home' },
  { to: '/pro/clients', ic: 'clients', label: 'Clients' },
  { to: '/pro/properties', ic: 'properties', label: 'Properties' },
  { to: '/pro/experts', ic: 'experts', label: 'Experts' },
  { to: '/pro/visits', ic: 'homewatch', label: 'Home Watch' },
  { to: '/pro/requests', ic: 'concierge', label: 'Requests' },
  { to: '/pro/settings', ic: 'settings', label: 'Settings' },
] as const

export function ProLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bell, setBell] = useState(false)
  const unread = useStore(() => notificationsFor('pro').filter((n) => !n.read).length)

  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <div className="pro">
      <aside className="pro-sidebar">
        <div className="pro-logo">
          <img className="pro-logo-img" src={BRAND_LOGO} alt="Local Luxe Concierge" />
          <div className="s" style={{ marginTop: 4 }}>PRO PORTAL</div>
        </div>
        <nav className="pro-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={(n as { end?: boolean }).end} className={({ isActive }) => (isActive ? 'active' : '')}>
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
            <div className="pro-avatar" style={{ background: '#1d4e6b', color: '#c5a74e', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
              {user?.name?.[0] ?? 'L'}
            </div>
          </div>
        </header>

        {bell && <ProNotifications onClose={() => setBell(false)} onGo={(u) => { setBell(false); navigate(u) }} />}
        {children}
      </main>
    </div>
  )
}

function ProNotifications({ onClose, onGo }: { onClose: () => void; onGo: (u: string) => void }) {
  const items = useStore(() => notificationsFor('pro'))
  useEffect(() => {
    markNotificationsRead('pro')
  }, [])
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
