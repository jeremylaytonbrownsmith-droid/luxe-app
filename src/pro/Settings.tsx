import { useState } from 'react'
import { ProLayout } from './ProLayout'
import { useAuth } from '../auth'
import { resetDemo } from '../data'
import { isDemo } from '../firebase'
import { notificationPermission, requestNotificationPermission } from '../notifications'

export default function Settings() {
  const { user } = useAuth()
  const [perm, setPerm] = useState(notificationPermission())

  return (
    <ProLayout title="Settings" subtitle="Manage your Local Luxe Pro account.">
      <div className="p-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="pcard">
          <div className="p-eyebrow" style={{ marginBottom: 8 }}>Account</div>
          <h3>{user?.name}</h3>
          <p className="p-muted" style={{ fontSize: 14 }}>{user?.email}</p>
          <p className="p-muted" style={{ fontSize: 13, marginTop: 4 }}>Local Luxe Concierge · Bluffton / Hilton Head, SC</p>
        </div>

        <div className="pcard">
          <div className="p-eyebrow" style={{ marginBottom: 8 }}>Notifications</div>
          <div className="row">
            <span className="p-muted" style={{ fontSize: 14 }}>Push status: {perm}</span>
            {perm !== 'granted' && (
              <button className="pbtn sm" onClick={async () => setPerm(await requestNotificationPermission())}>Enable</button>
            )}
          </div>
        </div>
      </div>

      <div className="pcard" style={{ marginTop: 16 }}>
        <div className="p-eyebrow" style={{ marginBottom: 8 }}>Mode</div>
        <p className="p-muted" style={{ fontSize: 14, marginBottom: 12 }}>
          {isDemo
            ? 'Running in demo mode on local sample data. Add Firebase keys in .env to go live.'
            : 'Connected to Firebase.'}
        </p>
        {isDemo && (
          <button className="pbtn ghost sm" onClick={() => { resetDemo(); location.reload() }}>Reset demo data</button>
        )}
      </div>
    </ProLayout>
  )
}
