import { allRequests, getProperty, setRequestStatus, useStore } from '../data'
import { OperatorNav, Screen, Toast, fmtDate, useToast } from '../components'
import { pushLocal } from '../notifications'
import type { RequestStatus } from '../types'

const NEXT: Record<RequestStatus, RequestStatus | null> = {
  new: 'acknowledged',
  acknowledged: 'scheduled',
  scheduled: 'done',
  done: null,
}
const ACTION_LABEL: Record<RequestStatus, string> = {
  new: 'Acknowledge',
  acknowledged: 'Mark scheduled',
  scheduled: 'Mark done',
  done: 'Completed',
}

export default function OperatorRequests() {
  const requests = useStore(() => allRequests())
  const { msg, show } = useToast()

  const advance = async (id: string, status: RequestStatus, category: string) => {
    const next = NEXT[status]
    if (!next) return
    setRequestStatus(id, next)
    await pushLocal({
      title: 'Concierge request update',
      body: `"${category}" is now ${next}.`,
      url: '/owner',
    })
    show(`Owner notified: ${next}`)
  }

  return (
    <Screen nav={<OperatorNav />}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Concierge Requests</h1>
      {requests.length === 0 && <div className="empty">No requests yet.</div>}
      <div className="stack">
        {requests.map((r) => {
          const prop = getProperty(r.propertyId)
          const pillClass = r.status === 'new' ? 'new' : r.status === 'done' ? 'ok' : 'warn'
          return (
            <div key={r.id} className="card" style={{ margin: 0 }}>
              <div className="row">
                <h3 style={{ fontSize: 16 }}>{r.category}</h3>
                <span className={`pill ${pillClass}`}>{r.status}</span>
              </div>
              <p className="muted" style={{ fontSize: 13, margin: '4px 0 10px' }}>
                {r.ownerName} · {prop?.address} · {fmtDate(r.createdAt)}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{r.details}</p>
              {NEXT[r.status] && (
                <button
                  className="btn sm"
                  style={{ marginTop: 14 }}
                  onClick={() => advance(r.id, r.status, r.category)}
                >
                  {ACTION_LABEL[r.status]} →
                </button>
              )}
            </div>
          )
        })}
      </div>
      <Toast msg={msg} />
    </Screen>
  )
}
