import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useStore, visitsForProperty } from '../data'
import { OwnerNav, Screen, fmtDate } from '../components'

export default function OwnerVisits() {
  const { user } = useAuth()
  const visits = useStore(() => visitsForProperty(user?.propertyId))

  return (
    <Screen nav={<OwnerNav />}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Visit History</h1>
      {visits.length === 0 && <div className="empty">No visits yet.</div>}
      <div className="stack">
        {visits.map((v) => {
          const completed = v.status === 'completed'
          const inner = (
            <div className="card" style={{ margin: 0 }}>
              <div className="row">
                <h3 style={{ fontSize: 17 }}>{fmtDate(v.completedAt || v.scheduledFor)}</h3>
                <span className={`pill ${completed ? 'ok' : 'info'}`}>
                  {completed ? '✓ Report ready' : v.status}
                </span>
              </div>
              {completed ? (
                <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                  {v.photos.length} photos · tap to view report →
                </p>
              ) : (
                <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>Upcoming visit</p>
              )}
            </div>
          )
          return completed ? (
            <Link key={v.id} to={`/owner/report/${v.id}`}>{inner}</Link>
          ) : (
            <div key={v.id}>{inner}</div>
          )
        })}
      </div>
    </Screen>
  )
}
