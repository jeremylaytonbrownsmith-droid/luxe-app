import { useNavigate, useParams } from 'react-router-dom'
import { OwnerLayout } from '../Shell'
import { getVisit, useStore } from '../data'
import { fmtDate } from '../components'

export default function ReportView() {
  const { id = '' } = useParams()
  const visit = useStore(() => getVisit(id))
  const navigate = useNavigate()

  if (!visit) {
    return <OwnerLayout title="Report"><p className="p-muted">Report not found.</p></OwnerLayout>
  }
  const issues = visit.checklist.filter((c) => c.ok === false)

  return (
    <OwnerLayout
      title={`Home checked ${fmtDate(visit.completedAt || visit.scheduledFor)}`}
      subtitle={`${visit.checklist.length}-point inspection`}
      actions={<button className="pbtn ghost sm" onClick={() => navigate(-1)}>← Back</button>}
    >
      <div className="p-grid main">
        <div>
          {visit.summary && (
            <div className="pcard">
              <div className="p-eyebrow" style={{ marginBottom: 8 }}>Summary</div>
              <p style={{ fontSize: 15, lineHeight: 1.55 }}>{visit.summary}</p>
            </div>
          )}

          {visit.photos.length > 0 && (
            <div className="pcard">
              <div className="p-eyebrow" style={{ marginBottom: 12 }}>Photos</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
                {visit.photos.map((p) => (
                  <div key={p.id} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--p-line)' }}>
                    <img src={p.dataUrl} alt={p.caption} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                    <div className="p-muted" style={{ fontSize: 12, padding: '7px 9px' }}>{p.caption}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pcard">
          <div className="row" style={{ marginBottom: 12 }}>
            <div className="p-eyebrow" style={{ marginBottom: 0 }}>Inspection</div>
            <span className={`ppill ${issues.length ? 'warn' : 'done'}`}>{issues.length ? `${issues.length} flagged` : '✓ All clear'}</span>
          </div>
          {visit.checklist.map((c) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--p-line)' }}>
              <span style={{ flex: 1, fontSize: 14 }}>
                {c.label}
                {c.note && <span className="p-muted" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{c.note}</span>}
              </span>
              <span className={`ppill ${c.ok === false ? 'warn' : 'done'}`}>{c.ok === false ? 'Note' : 'OK'}</span>
            </div>
          ))}
        </div>
      </div>
    </OwnerLayout>
  )
}
