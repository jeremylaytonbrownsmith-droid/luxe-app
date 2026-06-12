import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProLayout } from './ProLayout'
import { getProperty, upsertProperty, useStore } from '../data'
import type { Plan, PropertyStatus } from '../types'

export default function PropertyForm() {
  const { id } = useParams()
  const existing = useStore(() => (id ? getProperty(id) : undefined))
  const navigate = useNavigate()

  const [f, setF] = useState({
    name: existing?.name ?? '',
    address: existing?.address ?? '',
    community: existing?.community ?? '',
    beds: existing?.beds ?? 3,
    baths: existing?.baths ?? 2,
    yearBuilt: existing?.yearBuilt ?? new Date().getFullYear(),
    sqft: existing?.sqft ?? 2000,
    salePrice: existing?.salePrice ?? undefined,
    status: (existing?.status ?? 'active') as PropertyStatus,
    plan: (existing?.plan ?? 'weekly') as Plan,
    sizeTier: existing?.sizeTier ?? 'mid',
  })
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: Number(e.target.value) })
  const str = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })

  const save = () => {
    if (!f.name || !f.address) return
    const p = upsertProperty({
      id: existing?.id,
      name: f.name,
      address: f.address,
      community: f.community,
      beds: f.beds,
      baths: f.baths,
      yearBuilt: f.yearBuilt,
      sqft: f.sqft,
      salePrice: f.salePrice,
      status: f.status,
      plan: f.plan,
      sizeTier: f.sizeTier as 'condo' | 'mid' | 'large',
      photoUrl: existing?.photoUrl ?? phPhoto(f.name),
    })
    navigate(`/pro/properties/${p.id}`)
  }

  return (
    <ProLayout
      title={existing ? 'Edit Property' : 'New Property'}
      actions={
        <>
          <button className="pbtn ghost sm" onClick={() => navigate(-1)}>Cancel</button>
          <button className="pbtn sm" onClick={save} disabled={!f.name || !f.address}>Save</button>
        </>
      }
    >
      <div className="pcard">
        <div className="p-eyebrow" style={{ marginBottom: 12 }}>Property details</div>
        <label>Name your property *</label>
        <input value={f.name} onChange={str('name')} placeholder="e.g. Wexford Waterfront" />
        <label>Address *</label>
        <input value={f.address} onChange={str('address')} placeholder="Street address" />
        <label>Community</label>
        <input value={f.community} onChange={str('community')} placeholder="e.g. Sea Pines, Hilton Head Island" />
        <div className="field-grid-3">
          <div><label>Bedrooms</label><input type="number" value={f.beds} onChange={num('beds')} /></div>
          <div><label>Bathrooms</label><input type="number" step="0.5" value={f.baths} onChange={num('baths')} /></div>
          <div><label>Year built</label><input type="number" value={f.yearBuilt} onChange={num('yearBuilt')} /></div>
        </div>
        <div className="field-grid">
          <div><label>Square ft</label><input type="number" value={f.sqft} onChange={num('sqft')} /></div>
          <div><label>Value / sale price</label><input type="number" value={f.salePrice ?? ''} onChange={num('salePrice')} placeholder="$" /></div>
        </div>
      </div>

      <div className="pcard">
        <div className="p-eyebrow" style={{ marginBottom: 12 }}>Home watch plan</div>
        <div className="field-grid">
          <div>
            <label>Plan</label>
            <select value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as Plan })}>
              <option value="weekly">Weekly</option>
              <option value="bi-monthly">Bi-monthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as PropertyStatus })}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>
    </ProLayout>
  )
}

function phPhoto(label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
    <rect width='600' height='400' fill='#1d4e6b'/>
    <text x='50%' y='52%' font-family='Raleway,Arial' font-size='28' fill='rgba(255,255,255,0.92)'
      text-anchor='middle'>${label || 'Property'}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}
