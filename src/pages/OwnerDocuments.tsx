import { OwnerLayout } from '../Shell'
import { useAuth } from '../auth'
import { getProperty, useStore } from '../data'
import { Icon } from '../icons'

export default function OwnerDocuments() {
  const { user } = useAuth()
  const property = useStore(() => getProperty(user?.propertyId))
  const shared = (property?.documents ?? []).filter((d) => property?.sharedDocIds.includes(d.id))

  return (
    <OwnerLayout title="Documents" subtitle="Important files for your home.">
      <div className="pcard">
        {shared.length === 0 ? (
          <p className="p-muted" style={{ fontSize: 14 }}>No documents shared yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
            {shared.map((d) => (
              <div key={d.id} className="share-row" style={{ cursor: 'pointer' }}>
                <span style={{ color: 'var(--sage-deep)' }}><Icon name="document" size={22} /></span>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{d.name}</span>
                <span className="ppill info">{d.kind.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  )
}
