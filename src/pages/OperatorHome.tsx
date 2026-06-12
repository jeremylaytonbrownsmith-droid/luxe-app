import { Link } from 'react-router-dom'
import { getProperty, todaysQueue, useStore, allRequests } from '../data'
import { EnablePushBanner, OperatorNav, Screen, fmtDate } from '../components'

export default function OperatorHome() {
  const queue = useStore(() => todaysQueue())
  const newRequests = useStore(() => allRequests().filter((r) => r.status === 'new').length)

  return (
    <Screen nav={<OperatorNav />}>
      <p className="script">today’s route</p>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Scheduled Visits</h1>

      <EnablePushBanner />

      {newRequests > 0 && (
        <Link to="/operator/requests">
          <div className="banner">
            <span style={{ fontSize: 18 }}>✨</span>
            <span style={{ flex: 1 }}>
              {newRequests} new concierge request{newRequests > 1 ? 's' : ''} awaiting response
            </span>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>View →</span>
          </div>
        </Link>
      )}

      {queue.length === 0 && <div className="empty">No visits in the queue. 🎉</div>}

      <div className="stack">
        {queue.map((v) => {
          const prop = getProperty(v.propertyId)
          return (
            <Link key={v.id} to={`/operator/visit/${v.id}`}>
              <div className="card" style={{ margin: 0 }}>
                <div className="row">
                  <h3 style={{ fontSize: 17 }}>{prop?.address}</h3>
                  <span className={`pill ${v.status === 'in-progress' ? 'warn' : 'info'}`}>
                    {v.status === 'in-progress' ? 'In progress' : fmtDate(v.scheduledFor)}
                  </span>
                </div>
                <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                  {prop?.community} · {prop?.ownerName}
                </p>
                <p style={{ marginTop: 12, color: 'var(--gold)', fontWeight: 600, fontSize: 14 }}>
                  {v.status === 'in-progress' ? 'Continue inspection →' : 'Start inspection →'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </Screen>
  )
}
