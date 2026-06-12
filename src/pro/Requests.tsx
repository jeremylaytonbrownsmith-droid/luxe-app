import { ProLayout } from './ProLayout'
import { allRequests, getProperty, setRequestStatus, useStore } from '../data'
import { fmtDate } from '../components'
import { pushLocal } from '../notifications'
import type { RequestStatus } from '../types'

const NEXT: Record<RequestStatus, RequestStatus | null> = {
  new: 'acknowledged',
  acknowledged: 'scheduled',
  scheduled: 'done',
  done: null,
}
const LABEL: Record<RequestStatus, string> = {
  new: 'Acknowledge',
  acknowledged: 'Mark scheduled',
  scheduled: 'Mark done',
  done: 'Completed',
}

export default function Requests() {
  const requests = useStore(() => allRequests())

  const advance = async (id: string, status: RequestStatus, category: string) => {
    const next = NEXT[status]
    if (!next) return
    setRequestStatus(id, next)
    await pushLocal({ title: 'Concierge request update', body: `"${category}" is now ${next}.`, url: '/owner' })
  }

  return (
    <ProLayout title="Concierge Requests" subtitle="Requests from your homeowners.">
      <div className="p-grid two">
        {requests.map((r) => {
          const p = getProperty(r.propertyId)
          return (
            <div key={r.id} className="pcard">
              <div className="row" style={{ marginBottom: 6 }}>
                <h3 style={{ fontSize: 16 }}>{r.category}</h3>
                <span className={`ppill ${r.status}`}>{r.status}</span>
              </div>
              <p className="p-muted" style={{ fontSize: 12, marginBottom: 10 }}>{r.ownerName} · {p?.name} · {fmtDate(r.createdAt)}</p>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{r.details}</p>
              {NEXT[r.status] && (
                <button className="pbtn sm" style={{ marginTop: 14 }} onClick={() => advance(r.id, r.status, r.category)}>{LABEL[r.status]} →</button>
              )}
            </div>
          )
        })}
      </div>
      {requests.length === 0 && <p className="p-muted" style={{ padding: 24 }}>No requests yet.</p>}
    </ProLayout>
  )
}
