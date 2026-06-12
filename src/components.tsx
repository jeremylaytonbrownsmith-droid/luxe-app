// Small shared UI pieces used across both the owner and operator apps.
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { markNotificationsRead, notificationsFor, useStore } from './data'
import {
  notificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
} from './notifications'

export function TopBar({ onBell }: { onBell: () => void }) {
  const { user } = useAuth()
  const role = user?.role ?? 'owner'
  const unread = useStore(() => notificationsFor(role).filter((n) => !n.read).length)
  return (
    <header className="topbar">
      <div className="brand">
        <span className="name">LOCAL LUXE</span>
        <span className="sub">CONCIERGE</span>
      </div>
      <button className="icon-btn" onClick={onBell} aria-label="Notifications">
        🔔{unread > 0 && <span className="badge">{unread}</span>}
      </button>
    </header>
  )
}

export function OwnerNav() {
  return (
    <nav className="nav">
      <NavLink to="/owner" end className={({ isActive }) => (isActive ? 'active' : '')}>
        <span className="ic">🏠</span>Home
      </NavLink>
      <NavLink to="/owner/visits" className={({ isActive }) => (isActive ? 'active' : '')}>
        <span className="ic">📋</span>Reports
      </NavLink>
      <NavLink to="/owner/request" className={({ isActive }) => (isActive ? 'active' : '')}>
        <span className="ic">✨</span>Concierge
      </NavLink>
      <NavLink to="/owner/account" className={({ isActive }) => (isActive ? 'active' : '')}>
        <span className="ic">👤</span>Account
      </NavLink>
    </nav>
  )
}

// Slide-down notification list. Tapping a notification routes to its target.
export function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const role = user?.role ?? 'owner'
  const items = useStore(() => notificationsFor(role))
  const navigate = useNavigate()

  useEffect(() => {
    if (open) markNotificationsRead(role)
  }, [open, role])

  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
    >
      <div
        className="fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          margin: '0 auto',
          background: '#fff',
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          padding: 18,
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="row" style={{ marginBottom: 12 }}>
          <h3>Notifications</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {items.length === 0 && <div className="empty">No notifications yet.</div>}
        <div className="stack">
          {items.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => {
                onClose()
                navigate(n.url)
              }}
            >
              <div className="row">
                <strong style={{ fontFamily: 'var(--sans)', fontSize: 14 }}>{n.title}</strong>
                <span className="muted" style={{ fontSize: 11 }}>{timeAgo(n.createdAt)}</span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Prompts the user to enable push, then keeps quiet once granted/denied.
export function EnablePushBanner() {
  const [perm, setPerm] = useState<NotificationPermission>(notificationPermission())
  useEffect(() => {
    registerServiceWorker()
  }, [])
  if (perm === 'granted' || perm === 'denied') return null
  return (
    <div className="banner">
      <span style={{ fontSize: 18 }}>🔔</span>
      <span style={{ flex: 1 }}>Turn on notifications to get home watch reports the moment they’re ready.</span>
      <button
        className="btn sm"
        onClick={async () => setPerm(await requestNotificationPermission())}
      >
        Enable
      </button>
    </div>
  )
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null
  return <div className="toast">{msg}</div>
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const show = (m: string) => {
    setMsg(m)
    window.setTimeout(() => setMsg(null), 2600)
  }
  return { msg, show }
}

export function Screen({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  const [bell, setBell] = useState(false)
  return (
    <div className="app">
      <TopBar onBell={() => setBell(true)} />
      <NotificationsSheet open={bell} onClose={() => setBell(false)} />
      <main className="screen fade-in">{children}</main>
      {nav}
    </div>
  )
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function fmtMoney(n?: number): string {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}
