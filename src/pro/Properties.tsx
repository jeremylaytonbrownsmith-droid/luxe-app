import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProLayout } from './ProLayout'
import { getClient, getProperties, useStore } from '../data'
import { fmtMoney } from '../components'
import type { PropertyStatus } from '../types'

const TABS: { key: PropertyStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'sold', label: 'Sold' },
]

export default function Properties() {
  const properties = useStore(() => getProperties())
  const [tab, setTab] = useState<PropertyStatus | 'all'>('all')
  const navigate = useNavigate()

  const list = properties.filter((p) => tab === 'all' || p.status === tab)

  return (
    <ProLayout
      title="Properties"
      subtitle="Homes under your watch."
      actions={<Link to="/pro/properties/new" className="pbtn sm">+ New Property</Link>}
    >
      <div className="ptabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>
      <div className="prop-grid">
        {list.map((p) => {
          const client = getClient(p.clientId)
          return (
            <div key={p.id} className="prop-card" onClick={() => navigate(`/pro/properties/${p.id}`)}>
              <div className="img">
                {p.photoUrl && <img src={p.photoUrl} alt={p.name} />}
                <span className="tag">{p.status}</span>
              </div>
              <div className="body">
                <h3>{p.name}</h3>
                <div className="p-muted" style={{ fontSize: 12, marginTop: 2 }}>{p.address}</div>
                <div className="meta">
                  <span>{p.beds} bd</span>
                  <span>{p.baths} ba</span>
                  <span>{p.sqft.toLocaleString()} sqft</span>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--p-navy)' }}>{fmtMoney(p.salePrice)}</span>
                  <span className="p-muted" style={{ fontSize: 12 }}>{client ? `${client.firstName} ${client.lastName}` : 'Unassigned'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {list.length === 0 && <p className="p-muted" style={{ padding: 24 }}>No properties in this view.</p>}
    </ProLayout>
  )
}
