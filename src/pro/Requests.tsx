import { ProLayout } from './ProLayout'
import { addCompletionPhoto, allRequests, getProperty, setRequestStatus, useStore } from '../data'
import { fmtDate } from '../components'
import { pushLocal } from '../notifications'
import type { Photo, RequestStatus } from '../types'

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

function Thumbs({ photos }: { photos: Photo[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {photos.map((p) => (
        <img key={p.id} src={p.dataUrl} alt={p.caption} title={p.caption}
          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--p-line)' }} />
      ))}
    </div>
  )
}

export default function Requests() {
  const requests = useStore(() => allRequests())

  const advance = async (id: string, status: RequestStatus, category: string) => {
    const next = NEXT[status]
    if (!next) return
    setRequestStatus(id, next)
    await pushLocal({ title: 'Concierge request update', body: `"${category}" is now ${next}.`, url: '/owner' })
  }

  const onFinishPhoto = (requestId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => addCompletionPhoto(requestId, { caption: file.name.replace(/\.[^.]+$/, ''), dataUrl: String(reader.result) })
    reader.readAsDataURL(file)
    e.target.value = ''
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

              {r.photos.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="p-eyebrow" style={{ marginBottom: 6 }}>What the client wants</div>
                  <Thumbs photos={r.photos} />
                </div>
              )}

              {r.completionPhotos.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="p-eyebrow" style={{ marginBottom: 6 }}>Finished work</div>
                  <Thumbs photos={r.completionPhotos} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <label className="pbtn ghost sm" style={{ marginBottom: 0 }}>
                  + Finished photo
                  <input type="file" accept="image/*" capture="environment" hidden onChange={onFinishPhoto(r.id)} />
                </label>
                {NEXT[r.status] && (
                  <button className="pbtn sm" onClick={() => advance(r.id, r.status, r.category)}>{LABEL[r.status]} →</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {requests.length === 0 && <p className="p-muted" style={{ padding: 24 }}>No requests yet.</p>}
    </ProLayout>
  )
}
