import { useAuth } from '../auth'
import { expertsByIds, getProperty, useStore } from '../data'
import { OwnerNav, Screen } from '../components'
import { Icon } from '../icons'

export default function OwnerExperts() {
  const { user } = useAuth()
  const property = useStore(() => getProperty(user?.propertyId))
  const experts = expertsByIds(property?.sharedExpertIds ?? [])

  return (
    <Screen nav={<OwnerNav />}>
      <p className="script">recommended by local luxe</p>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Trusted Experts</h1>
      {experts.length === 0 ? (
        <div className="empty">No experts shared yet.</div>
      ) : (
        <div className="stack">
          {experts.map((e) => (
            <div key={e.id} className="card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                {e.logoUrl && <img src={e.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10 }} />}
                <div>
                  <h3 style={{ fontSize: 16 }}>{e.company}</h3>
                  <p className="muted" style={{ fontSize: 12 }}>{e.categories.join(' · ')}</p>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{e.description}</p>
              <div className="row" style={{ justifyContent: 'flex-start' }}>
                <a href={`tel:${e.phone}`} className="btn sm ghost" style={{ width: 'auto', gap: 6 }}><Icon name="phone" size={16} /> {e.phone}</a>
                <a href={`mailto:${e.email}`} className="btn sm ghost" style={{ width: 'auto', gap: 6 }}><Icon name="mail" size={16} /> Email</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  )
}
