import { Link, useNavigate } from 'react-router-dom'
import { ProLayout } from './ProLayout'
import {
  allRequests,
  getClient,
  getProperties,
  getProperty,
  stats,
  upcomingVisits,
  useStore,
} from '../data'
import { fmtDate } from '../components'

export default function Dashboard() {
  const s = useStore(() => stats())
  const visits = useStore(() => upcomingVisits())
  const requests = useStore(() => allRequests().filter((r) => r.status !== 'done'))
  const properties = useStore(() => getProperties())
  const navigate = useNavigate()

  return (
    <ProLayout
      title="Dashboard"
      subtitle="Welcome back to your Local Luxe command center."
      actions={<Link to="/pro/properties/new" className="pbtn gold sm">+ New Property</Link>}
    >
      <div className="p-grid p-stats" style={{ marginBottom: 18 }}>
        <Link to="/pro/clients"><div className="stat"><div className="v">{s.clients}</div><div className="l">Clients</div></div></Link>
        <Link to="/pro/properties"><div className="stat"><div className="v">{s.properties}</div><div className="l">Properties</div></div></Link>
        <Link to="/pro/visits"><div className="stat teal"><div className="v">{s.upcomingVisits}</div><div className="l">Upcoming visits</div></div></Link>
        <Link to="/pro/requests"><div className="stat gold"><div className="v">{s.openRequests}</div><div className="l">Open requests</div></div></Link>
      </div>

      <div className="p-grid two">
        <div className="pcard">
          <div className="row" style={{ marginBottom: 12 }}>
            <h3>Upcoming home watch</h3>
            <Link to="/pro/visits" className="p-muted" style={{ fontSize: 13 }}>View all →</Link>
          </div>
          {visits.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>Nothing scheduled.</p>}
          {visits.slice(0, 4).map((v) => {
            const p = getProperty(v.propertyId)
            return (
              <div key={v.id} className="prow" style={{ gridTemplateColumns: '1fr auto', marginBottom: 8 }}
                onClick={() => navigate(`/pro/visits/${v.id}`)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p?.name}</div>
                  <div className="p-muted" style={{ fontSize: 12 }}>{p?.community}</div>
                </div>
                <span className={`ppill ${v.status === 'in-progress' ? 'pending' : 'invited'}`}>
                  {v.status === 'in-progress' ? 'In progress' : fmtDate(v.scheduledFor)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="pcard">
          <div className="row" style={{ marginBottom: 12 }}>
            <h3>Open concierge requests</h3>
            <Link to="/pro/requests" className="p-muted" style={{ fontSize: 13 }}>View all →</Link>
          </div>
          {requests.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>No open requests.</p>}
          {requests.slice(0, 4).map((r) => (
            <div key={r.id} className="prow" style={{ gridTemplateColumns: '1fr auto', marginBottom: 8 }}
              onClick={() => navigate('/pro/requests')}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.category}</div>
                <div className="p-muted" style={{ fontSize: 12 }}>{r.ownerName}</div>
              </div>
              <span className={`ppill ${r.status}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pcard" style={{ marginTop: 16 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <h3>Recent properties</h3>
          <Link to="/pro/properties" className="p-muted" style={{ fontSize: 13 }}>View all →</Link>
        </div>
        <div className="prop-grid">
          {properties.slice(0, 3).map((p) => {
            const client = getClient(p.clientId)
            return (
              <div key={p.id} className="prop-card" onClick={() => navigate(`/pro/properties/${p.id}`)}>
                <div className="img">
                  {p.photoUrl && <img src={p.photoUrl} alt={p.name} />}
                  <span className="tag">{p.status}</span>
                </div>
                <div className="body">
                  <h3>{p.name}</h3>
                  <div className="p-muted" style={{ fontSize: 12, marginTop: 2 }}>{p.community}</div>
                  <div className="p-muted" style={{ fontSize: 12, marginTop: 6 }}>
                    {client ? `${client.firstName} ${client.lastName}` : 'Unassigned'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ProLayout>
  )
}
