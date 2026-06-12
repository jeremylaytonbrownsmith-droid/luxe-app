import { useNavigate, useParams, Link } from 'react-router-dom'
import { ProLayout } from './ProLayout'
import {
  addPropertyDoc,
  expertsByIds,
  getClient,
  getProperty,
  setPropertyStatus,
  useStore,
  visitsForProperty,
} from '../data'
import { fmtDate, fmtMoney } from '../components'

export default function PropertyDetail() {
  const { id = '' } = useParams()
  const property = useStore(() => getProperty(id))
  const visits = useStore(() => visitsForProperty(id))
  const navigate = useNavigate()

  if (!property) {
    return <ProLayout title="Property"><p className="p-muted">Property not found.</p></ProLayout>
  }
  const client = getClient(property.clientId)
  const sharedExperts = expertsByIds(property.sharedExpertIds)
  const lastReport = visits.find((v) => v.status === 'completed')

  const addDoc = () => {
    const name = prompt('Document name (e.g. Homeowner’s Insurance Policy):')
    if (name) addPropertyDoc(property.id, name, 'pdf')
  }

  return (
    <ProLayout
      title={property.name}
      subtitle={property.address}
      actions={
        <>
          <button className="pbtn ghost sm" onClick={() => navigate(`/pro/properties/${property.id}/edit`)}>Edit</button>
          <Link to={`/pro/properties/${property.id}/invite`} className="pbtn gold sm">Invite Client</Link>
        </>
      }
    >
      <div className="p-grid main">
        <div className="pcard" style={{ padding: 0, overflow: 'hidden' }}>
          {property.photoUrl && <img src={property.photoUrl} alt={property.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />}
          <div style={{ padding: 20 }}>
            <div className="row" style={{ marginBottom: 10 }}>
              <span className={`ppill ${property.status}`}>{property.status}</span>
              <span style={{ fontWeight: 700, color: 'var(--p-navy)', fontSize: 18 }}>{fmtMoney(property.salePrice)}</span>
            </div>
            <div className="meta" style={{ display: 'flex', gap: 16, color: 'var(--p-muted)', fontSize: 13 }}>
              <span>{property.beds} bd</span>
              <span>{property.baths} ba</span>
              <span>{property.sqft.toLocaleString()} sqft</span>
              <span>Built {property.yearBuilt}</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              {(['active', 'pending', 'sold'] as const).map((s) => (
                <button key={s} className={`pbtn ${property.status === s ? 'navy' : 'ghost'} sm`} onClick={() => setPropertyStatus(property.id, s)} style={{ textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="pcard">
          <div className="p-eyebrow" style={{ marginBottom: 10 }}>Client</div>
          {client ? (
            <>
              <h3 style={{ fontSize: 17 }}>{client.firstName} {client.lastName}</h3>
              <p className="p-muted" style={{ fontSize: 13, marginTop: 4 }}>{client.phone}</p>
              <p className="p-muted" style={{ fontSize: 13 }}>{client.email}</p>
              <span className={`ppill ${client.inviteStatus}`} style={{ marginTop: 10, display: 'inline-flex' }}>{client.inviteStatus}</span>
            </>
          ) : (
            <>
              <p className="p-muted" style={{ fontSize: 14 }}>No client linked yet.</p>
              <Link to={`/pro/properties/${property.id}/invite`} className="pbtn sm" style={{ marginTop: 12 }}>Invite a client</Link>
            </>
          )}
          {lastReport && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--p-line)' }}>
              <div className="p-eyebrow" style={{ marginBottom: 6 }}>Last home watch</div>
              <p style={{ fontSize: 14 }}>{fmtDate(lastReport.completedAt || lastReport.scheduledFor)} · {lastReport.photos.length} photos</p>
            </div>
          )}
        </div>
      </div>

      <div className="pcard" style={{ marginTop: 16 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <h3>Documents</h3>
          <button className="pbtn ghost sm" onClick={addDoc}>+ Add document</button>
        </div>
        {property.documents.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>No documents uploaded.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
          {property.documents.map((d) => (
            <div key={d.id} className="share-row" style={{ cursor: 'default' }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pcard" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Recommended experts shared with client</h3>
        {sharedExperts.length === 0 && <p className="p-muted" style={{ fontSize: 14 }}>None shared yet — add some when you invite the client.</p>}
        <div className="prop-grid">
          {sharedExperts.map((e) => (
            <div key={e.id} className="share-row" style={{ cursor: 'default' }}>
              {e.logoUrl && <img src={e.logoUrl} alt="" style={{ width: 34, height: 34, borderRadius: 8 }} />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.company}</div>
                <div className="p-muted" style={{ fontSize: 12 }}>{e.categories.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProLayout>
  )
}
