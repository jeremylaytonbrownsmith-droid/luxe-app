import { useNavigate } from 'react-router-dom'
import { ProLayout } from './ProLayout'
import { getProperty, upcomingVisits, useStore, visitsForProperty, getProperties } from '../data'
import { fmtDate } from '../components'

export default function Visits() {
  const upcoming = useStore(() => upcomingVisits())
  const properties = useStore(() => getProperties())
  const navigate = useNavigate()

  // Completed reports across all properties, most recent first.
  const completed = properties
    .flatMap((p) => visitsForProperty(p.id))
    .filter((v) => v.status === 'completed')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))

  return (
    <ProLayout title="Home Watch" subtitle="Scheduled visits and completed reports.">
      <div className="pcard">
        <h3 style={{ marginBottom: 12 }}>Upcoming visits</h3>
        {upcoming.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>Nothing scheduled.</p>}
        {upcoming.map((v) => {
          const p = getProperty(v.propertyId)
          return (
            <div key={v.id} className="prow" style={{ gridTemplateColumns: '1fr auto auto', marginBottom: 10 }} onClick={() => navigate(`/pro/visits/${v.id}`)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p?.name}</div>
                <div className="p-muted" style={{ fontSize: 12 }}>{p?.community}</div>
              </div>
              <span className={`ppill ${v.status === 'in-progress' ? 'pending' : 'invited'}`}>
                {v.status === 'in-progress' ? 'In progress' : fmtDate(v.scheduledFor)}
              </span>
              <button className="pbtn sm">{v.status === 'in-progress' ? 'Continue' : 'Start'} →</button>
            </div>
          )
        })}
      </div>

      <div className="pcard" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Completed reports</h3>
        {completed.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>No reports yet.</p>}
        {completed.map((v) => {
          const p = getProperty(v.propertyId)
          const issues = v.checklist.filter((c) => c.ok === false).length
          return (
            <div key={v.id} className="prow" style={{ gridTemplateColumns: '1fr auto', marginBottom: 10 }} onClick={() => navigate(`/pro/visits/${v.id}`)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p?.name}</div>
                <div className="p-muted" style={{ fontSize: 12 }}>{fmtDate(v.completedAt || v.scheduledFor)} · {v.photos.length} photos</div>
              </div>
              <span className={`ppill ${issues ? 'pending' : 'done'}`}>{issues ? `${issues} flagged` : '✓ All clear'}</span>
            </div>
          )
        })}
      </div>
    </ProLayout>
  )
}
