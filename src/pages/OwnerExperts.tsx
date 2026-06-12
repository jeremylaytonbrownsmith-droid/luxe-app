import { OwnerLayout } from '../Shell'
import { useAuth } from '../auth'
import { expertsByIds, getProperty, useStore } from '../data'
import { Icon } from '../icons'

export default function OwnerExperts() {
  const { user } = useAuth()
  const property = useStore(() => getProperty(user?.propertyId))
  const experts = expertsByIds(property?.sharedExpertIds ?? [])

  return (
    <OwnerLayout title="Trusted Experts" subtitle="Vetted local providers, recommended by Local Luxe.">
      {experts.length === 0 ? (
        <div className="pcard"><p className="p-muted" style={{ fontSize: 14 }}>No experts shared yet.</p></div>
      ) : (
        <div className="prop-grid">
          {experts.map((e) => (
            <div key={e.id} className="pcard">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                {e.logoUrl && <img src={e.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10 }} />}
                <div>
                  <h3 style={{ fontSize: 16 }}>{e.company}</h3>
                  <p className="p-muted" style={{ fontSize: 12 }}>{e.categories.join(' · ')}</p>
                </div>
              </div>
              <p className="p-muted" style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>{e.description}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:${e.phone}`} className="pbtn ghost sm" style={{ gap: 6 }}><Icon name="phone" size={15} /> {e.phone}</a>
                <a href={`mailto:${e.email}`} className="pbtn ghost sm" style={{ gap: 6 }}><Icon name="mail" size={15} /> Email</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </OwnerLayout>
  )
}
