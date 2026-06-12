import { Link, useNavigate } from 'react-router-dom'
import { OwnerLayout } from '../Shell'
import { useAuth } from '../auth'
import { getProperty, requestsForProperty, useStore, visitsForProperty } from '../data'
import { fmtDate } from '../components'
import { Icon } from '../icons'
import {
  notificationPermission,
  requestNotificationPermission,
} from '../notifications'
import { useState } from 'react'

export default function OwnerHome() {
  const { user } = useAuth()
  const pid = user?.propertyId
  const property = useStore(() => getProperty(pid))
  const visits = useStore(() => visitsForProperty(pid))
  const requests = useStore(() => requestsForProperty(pid))
  const navigate = useNavigate()
  const [perm, setPerm] = useState(notificationPermission())

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const first = user?.name.split(' ')[0]

  const upcoming = visits.filter((v) => v.status !== 'completed').sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
  const next = upcoming[0]
  const completed = visits.filter((v) => v.status === 'completed')
  const lastReport = completed[0]
  const openReqs = requests.filter((r) => r.status !== 'done')
  const thisMonth = visits.filter((v) => new Date(v.scheduledFor).getMonth() === new Date().getMonth()).length

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <OwnerLayout
      title={`${greet}, ${first}`}
      subtitle={property ? `${property.address} · ${property.community}` : 'Your home'}
      actions={<span className="p-muted" style={{ fontSize: 14, fontWeight: 600 }}>{today}</span>}
    >
      {perm !== 'granted' && perm !== 'denied' && (
        <div className="banner" style={{ marginBottom: 18 }}>
          <span style={{ color: 'var(--gold-ink)' }}><Icon name="bell" size={18} /></span>
          <span style={{ flex: 1 }}>Turn on notifications to get home watch reports the moment they’re ready.</span>
          <button className="pbtn sm" onClick={async () => setPerm(await requestNotificationPermission())}>Enable</button>
        </div>
      )}

      {/* Stat cards */}
      <div className="p-grid p-stats" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="v">{upcoming.length}</div><div className="l">Upcoming visits</div></div>
        <div className="stat"><div className="v">{thisMonth}</div><div className="l">This month</div></div>
        <div className="stat gold"><div className="v">{openReqs.length}</div><div className="l">Open requests</div></div>
        <div className="stat teal"><div className="v">{completed.length}</div><div className="l">Reports</div></div>
      </div>

      {/* Hero: next visit */}
      <div
        style={{
          borderRadius: 16,
          padding: '22px 24px',
          marginBottom: 18,
          color: '#fff',
          background: 'linear-gradient(135deg, #2f5167 0%, #203a48 100%)',
          boxShadow: '0 12px 30px rgba(20,40,70,0.18)',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
          Next home watch visit
        </div>
        {next ? (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, margin: '6px 0 12px' }}>{fmtDate(next.scheduledFor)}</div>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="calendar" size={16} /> {property?.plan} plan</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="home" size={16} /> {property?.name}</span>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 8 }}>No upcoming visit scheduled.</div>
        )}
      </div>

      {/* Two-column content */}
      <div className="p-grid main">
        <div>
          {lastReport && (
            <Link to={`/owner/report/${lastReport.id}`}>
              <div className="pcard" style={{ marginBottom: 16 }}>
                <div className="p-eyebrow" style={{ marginBottom: 6 }}>Latest report</div>
                <div className="row">
                  <h3>Home checked {fmtDate(lastReport.completedAt || lastReport.scheduledFor)}</h3>
                  <span className="ppill done">✓ All clear</span>
                </div>
                <p className="p-muted" style={{ fontSize: 14, marginTop: 8 }}>{lastReport.photos.length} photos · {lastReport.checklist.length}-point inspection</p>
                <p style={{ marginTop: 12, color: 'var(--sage-deep)', fontWeight: 700, fontSize: 14 }}>View full report →</p>
              </div>
            </Link>
          )}

          <div className="pcard">
            <div className="row" style={{ marginBottom: 12 }}>
              <h3>Visit history</h3>
              <Link to="/owner/visits" className="p-muted" style={{ fontSize: 13 }}>View all →</Link>
            </div>
            {visits.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>No visits yet.</p>}
            {visits.slice(0, 4).map((v) => {
              const done = v.status === 'completed'
              return (
                <div key={v.id} className="prow" style={{ gridTemplateColumns: '1fr auto', marginBottom: 8 }}
                  onClick={() => done && navigate(`/owner/report/${v.id}`)}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtDate(v.completedAt || v.scheduledFor)}</div>
                    <div className="p-muted" style={{ fontSize: 12 }}>{done ? `${v.photos.length} photos` : 'Upcoming'}</div>
                  </div>
                  <span className={`ppill ${done ? 'done' : 'invited'}`}>{done ? 'Report ready' : v.status}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="pcard" style={{ marginBottom: 16 }}>
            <div className="p-eyebrow" style={{ marginBottom: 12 }}>Quick actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/owner/request" className="pbtn"><Icon name="concierge" size={18} /> New concierge request</Link>
              <Link to="/owner/documents" className="pbtn ghost"><Icon name="document" size={18} /> Documents</Link>
              <Link to="/owner/experts" className="pbtn ghost"><Icon name="experts" size={18} /> Trusted experts</Link>
            </div>
          </div>

          <div className="pcard">
            <div className="row" style={{ marginBottom: 12 }}>
              <div className="p-eyebrow" style={{ marginBottom: 0 }}>Concierge requests</div>
              <Link to="/owner/request" className="p-muted" style={{ fontSize: 13 }}>New →</Link>
            </div>
            {requests.length === 0 ? (
              <p className="p-muted" style={{ fontSize: 14 }}>No requests yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {requests.slice(0, 4).map((r) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--p-line)', paddingBottom: 12 }}>
                    <div className="row">
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{r.category}</span>
                      <span className={`ppill ${r.status}`}>{r.status}</span>
                    </div>
                    {r.completionPhotos.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div className="p-muted" style={{ fontSize: 11, marginBottom: 4 }}>Finished work</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {r.completionPhotos.map((p) => (
                            <img key={p.id} src={p.dataUrl} alt={p.caption}
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--p-line)' }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  )
}
