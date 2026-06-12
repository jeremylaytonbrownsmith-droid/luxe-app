import { useNavigate } from 'react-router-dom'
import { OwnerLayout } from '../Shell'
import { useAuth } from '../auth'
import { useStore, visitsForProperty } from '../data'
import { fmtDate } from '../components'

export default function OwnerVisits() {
  const { user } = useAuth()
  const visits = useStore(() => visitsForProperty(user?.propertyId))
  const navigate = useNavigate()

  return (
    <OwnerLayout title="Reports" subtitle="Your home watch visit history.">
      <div className="pcard">
        {visits.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>No visits yet.</p>}
        {visits.map((v) => {
          const done = v.status === 'completed'
          const issues = v.checklist.filter((c) => c.ok === false).length
          return (
            <div key={v.id} className="prow" style={{ gridTemplateColumns: '1fr auto', marginBottom: 10 }}
              onClick={() => done && navigate(`/owner/report/${v.id}`)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtDate(v.completedAt || v.scheduledFor)}</div>
                <div className="p-muted" style={{ fontSize: 13 }}>{done ? `${v.photos.length} photos · tap to view` : 'Upcoming visit'}</div>
              </div>
              <span className={`ppill ${done ? (issues ? 'warn' : 'done') : 'invited'}`}>
                {done ? (issues ? `${issues} flagged` : '✓ All clear') : v.status}
              </span>
            </div>
          )
        })}
      </div>
    </OwnerLayout>
  )
}
