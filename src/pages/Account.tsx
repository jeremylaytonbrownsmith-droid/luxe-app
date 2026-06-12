import { useAuth } from '../auth'
import { getProperty, resetDemo, useStore } from '../data'
import { OperatorNav, OwnerNav, Screen } from '../components'
import {
  notificationPermission,
  requestNotificationPermission,
} from '../notifications'
import { isDemo } from '../firebase'
import { useState } from 'react'

export default function Account() {
  const { user, logout } = useAuth()
  const isOwner = user?.role === 'owner'
  const property = useStore(() => getProperty(user?.propertyId))
  const [perm, setPerm] = useState(notificationPermission())

  return (
    <Screen nav={isOwner ? <OwnerNav /> : <OperatorNav />}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Account</h1>

      <div className="card">
        <div className="eyebrow">Signed in as</div>
        <h3>{user?.name}</h3>
        <p className="muted">{user?.email}</p>
        <p className="muted" style={{ textTransform: 'capitalize', marginTop: 4 }}>{user?.role}</p>
      </div>

      {isOwner && property && (
        <div className="card">
          <div className="eyebrow">Property</div>
          <h3 style={{ fontSize: 17 }}>{property.address}</h3>
          <p className="muted">{property.community}</p>
          <p className="muted" style={{ marginTop: 6, textTransform: 'capitalize' }}>
            {property.plan} plan
          </p>
        </div>
      )}

      <div className="card">
        <div className="eyebrow">Notifications</div>
        <div className="row">
          <span className="muted">Push status: {perm}</span>
          {perm !== 'granted' && (
            <button
              className="btn sm"
              onClick={async () => setPerm(await requestNotificationPermission())}
            >
              Enable
            </button>
          )}
        </div>
      </div>

      <div className="stack">
        {isDemo && (
          <button
            className="btn secondary"
            onClick={() => {
              resetDemo()
              location.reload()
            }}
          >
            Reset demo data
          </button>
        )}
        <button className="btn ghost" onClick={logout}>Sign out</button>
      </div>
    </Screen>
  )
}
