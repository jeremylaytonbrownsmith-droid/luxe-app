import { useNavigate, useParams } from 'react-router-dom'
import { getVisit, useStore } from '../data'
import { OwnerNav, Screen, fmtDate } from '../components'

export default function ReportView() {
  const { id = '' } = useParams()
  const visit = useStore(() => getVisit(id))
  const navigate = useNavigate()

  if (!visit) {
    return (
      <Screen nav={<OwnerNav />}>
        <div className="empty">Report not found.</div>
      </Screen>
    )
  }

  const issues = visit.checklist.filter((c) => c.ok === false)

  return (
    <Screen nav={<OwnerNav />}>
      <button className="btn sm ghost" style={{ marginBottom: 14 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <p className="script">home watch report</p>
      <h1 style={{ fontSize: 23, marginBottom: 4 }}>
        {fmtDate(visit.completedAt || visit.scheduledFor)}
      </h1>
      <div className="row" style={{ marginBottom: 16 }}>
        <span className="muted">{visit.checklist.length}-point inspection</span>
        <span className={`pill ${issues.length ? 'warn' : 'ok'}`}>
          {issues.length ? `${issues.length} item${issues.length > 1 ? 's' : ''} flagged` : '✓ All clear'}
        </span>
      </div>

      {visit.summary && (
        <div className="card">
          <div className="eyebrow">Summary</div>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>{visit.summary}</p>
        </div>
      )}

      {visit.photos.length > 0 && (
        <div className="card">
          <div className="eyebrow">Photos</div>
          <div className="photos">
            {visit.photos.map((p) => (
              <div key={p.id} className="photo">
                <img src={p.dataUrl} alt={p.caption} />
                <div className="cap">{p.caption}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="eyebrow">Inspection checklist</div>
        {visit.checklist.map((c) => (
          <div key={c.key} className="check">
            <span className="label">{c.label}</span>
            {c.ok === null ? (
              <span className="muted">—</span>
            ) : c.ok ? (
              <span className="pill ok">OK</span>
            ) : (
              <span className="pill warn">Note</span>
            )}
          </div>
        ))}
        {issues.map(
          (c) =>
            c.note && (
              <p key={c.key} className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                <strong style={{ color: 'var(--warn)' }}>{c.label}:</strong> {c.note}
              </p>
            )
        )}
      </div>
    </Screen>
  )
}
