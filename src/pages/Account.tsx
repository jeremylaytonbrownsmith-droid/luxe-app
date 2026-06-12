import { useState } from 'react'
import { OwnerLayout } from '../Shell'
import { useAuth } from '../auth'
import { getProperty, resetDemo, useStore } from '../data'
import { isDemo } from '../firebase'
import { notificationPermission, requestNotificationPermission } from '../notifications'

export default function Account() {
  const { user, logout } = useAuth()
  const property = useStore(() => getProperty(user?.propertyId))
  const [perm, setPerm] = useState(notificationPermission())

  return (
    <OwnerLayout title="Account" subtitle="Your profile and preferences.">
      <div className="p-grid two">
        <div className="pcard">
          <div className="p-eyebrow" style={{ marginBottom: 8 }}>Signed in as</div>
          <h3>{user?.name}</h3>
          <p className="p-muted" style={{ fontSize: 14 }}>{user?.email}</p>
        </div>

        {property && (
          <div className="pcard">
            <div className="p-eyebrow" style={{ marginBottom: 8 }}>Your property</div>
            <h3 style={{ fontSize: 17 }}>{property.name}</h3>
            <p className="p-muted" style={{ fontSize: 14 }}>{property.address}</p>
            <p className="p-muted" style={{ fontSize: 13, marginTop: 4, textTransform: 'capitalize' }}>{property.plan} plan</p>
          </div>
        )}

        <div className="pcard">
          <div className="p-eyebrow" style={{ marginBottom: 8 }}>Notifications</div>
          <div className="row">
            <span className="p-muted" style={{ fontSize: 14 }}>Push status: {perm}</span>
            {perm !== 'granted' && (
              <button className="pbtn sm" onClick={async () => setPerm(await requestNotificationPermission())}>Enable</button>
            )}
          </div>
        </div>

        <div className="pcard">
          <div className="p-eyebrow" style={{ marginBottom: 8 }}>Session</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isDemo && <button className="pbtn ghost sm" onClick={() => { resetDemo(); location.reload() }}>Reset demo data</button>}
            <button className="pbtn ghost sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>
    </OwnerLayout>
  )
}
