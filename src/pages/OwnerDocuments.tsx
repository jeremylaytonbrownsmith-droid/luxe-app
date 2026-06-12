import { useAuth } from '../auth'
import { getProperty, useStore } from '../data'
import { OwnerNav, Screen } from '../components'
import { Icon } from '../icons'

export default function OwnerDocuments() {
  const { user } = useAuth()
  const property = useStore(() => getProperty(user?.propertyId))
  const shared = (property?.documents ?? []).filter((d) => property?.sharedDocIds.includes(d.id))

  return (
    <Screen nav={<OwnerNav />}>
      <p className="script">your home</p>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Documents</h1>
      {shared.length === 0 ? (
        <div className="empty">No documents shared yet.</div>
      ) : (
        <div className="stack">
          {shared.map((d) => (
            <div key={d.id} className="card" style={{ margin: 0 }}>
              <div className="row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--sage-deep)' }}><Icon name="document" size={22} /></span>
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                </div>
                <span className="pill info">{d.kind.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  )
}
