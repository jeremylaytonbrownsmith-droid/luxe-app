import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import {
  getProperty,
  requestsForProperty,
  useStore,
  visitsForProperty,
} from '../data'
import { EnablePushBanner, OwnerNav, Screen, fmtDate } from '../components'

export default function OwnerHome() {
  const { user } = useAuth()
  const pid = user?.propertyId
  const property = useStore(() => getProperty(pid))
  const visits = useStore(() => visitsForProperty(pid))
  const requests = useStore(() => requestsForProperty(pid))

  const upcoming = visits.find((v) => v.status !== 'completed')
  const lastReport = visits.find((v) => v.status === 'completed')
  const openRequests = requests.filter((r) => r.status !== 'done')

  return (
    <Screen nav={<OwnerNav />}>
      <p className="script">hello, {user?.name.split(' ')[0]}</p>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Your Home</h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        {property?.address} · {property?.community}
      </p>

      <EnablePushBanner />

      {lastReport && (
        <Link to={`/owner/report/${lastReport.id}`}>
          <div className="card glow">
            <div className="eyebrow">Latest report</div>
            <div className="row">
              <h3>Home checked {fmtDate(lastReport.completedAt || lastReport.scheduledFor)}</h3>
              <span className="pill ok">✓ All clear</span>
            </div>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
              {lastReport.photos.length} photos · {lastReport.checklist.length}-point inspection
            </p>
            <p style={{ marginTop: 12, color: 'var(--gold)', fontWeight: 600, fontSize: 14 }}>
              View full report →
            </p>
          </div>
        </Link>
      )}

      <div className="card">
        <div className="eyebrow">Next visit</div>
        {upcoming ? (
          <div className="row">
            <h3>{fmtDate(upcoming.scheduledFor)}</h3>
            <span className="pill info">Scheduled</span>
          </div>
        ) : (
          <p className="muted">No upcoming visit scheduled.</p>
        )}
        <p className="muted" style={{ marginTop: 8, fontSize: 14, textTransform: 'capitalize' }}>
          {property?.plan} plan
        </p>
      </div>

      <div className="card">
        <div className="row">
          <div className="eyebrow" style={{ marginBottom: 0 }}>Concierge requests</div>
          <Link to="/owner/request" className="btn sm ghost">New request</Link>
        </div>
        {openRequests.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>No open requests.</p>
        ) : (
          <div className="stack" style={{ marginTop: 12 }}>
            {openRequests.map((r) => (
              <div key={r.id} className="row">
                <span style={{ fontSize: 14 }}>{r.category}</span>
                <span className={`pill ${r.status === 'new' ? 'new' : 'warn'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
