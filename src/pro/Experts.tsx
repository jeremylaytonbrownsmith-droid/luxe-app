import { useState } from 'react'
import { ProLayout } from './ProLayout'
import { deleteExpert, getExperts, upsertExpert, useStore } from '../data'
import { SERVICE_CATEGORIES, type Expert, type ServiceCategory } from '../types'

export default function Experts() {
  const experts = useStore(() => getExperts())
  const [editing, setEditing] = useState<Expert | 'new' | null>(null)

  return (
    <ProLayout
      title="My Experts"
      subtitle="Trusted service providers you recommend to clients."
      actions={<button className="pbtn sm" onClick={() => setEditing('new')}>+ New Expert</button>}
    >
      <div className="prop-grid">
        {experts.map((e) => (
          <div key={e.id} className="pcard" style={{ cursor: 'pointer' }} onClick={() => setEditing(e)}>
            <div className="who" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              {e.logoUrl && <img src={e.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />}
              <div>
                <h3 style={{ fontSize: 16 }}>{e.company}</h3>
                <div className="p-muted" style={{ fontSize: 12 }}>{e.serviceArea}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {e.categories.map((c) => (
                <span key={c} className="ppill unassigned" style={{ textTransform: 'none' }}>{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {editing && <ExpertForm expert={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </ProLayout>
  )
}

function ExpertForm({ expert, onClose }: { expert: Expert | null; onClose: () => void }) {
  const [f, setF] = useState({
    company: expert?.company ?? '',
    website: expert?.website ?? '',
    email: expert?.email ?? '',
    phone: expert?.phone ?? '',
    description: expert?.description ?? '',
    serviceArea: expert?.serviceArea ?? '',
  })
  const [cats, setCats] = useState<ServiceCategory[]>(expert?.categories ?? [])
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  const toggle = (c: ServiceCategory) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 5 ? [...prev, c] : prev))

  const save = () => {
    if (!f.company || !f.email) return
    upsertExpert({ id: expert?.id, ...f, categories: cats, logoUrl: expert?.logoUrl })
    onClose()
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ textAlign: 'left', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: 14 }}>
          <h3>{expert ? 'Edit Expert' : 'New Expert'}</h3>
          {expert && <button className="pbtn ghost sm" onClick={() => { deleteExpert(expert.id); onClose() }}>Delete</button>}
        </div>
        <div className="field-grid">
          <div><label>Company name *</label><input value={f.company} onChange={set('company')} /></div>
          <div><label>Website</label><input value={f.website} onChange={set('website')} /></div>
        </div>
        <div className="field-grid">
          <div><label>Email *</label><input value={f.email} onChange={set('email')} /></div>
          <div><label>Phone</label><input value={f.phone} onChange={set('phone')} /></div>
        </div>
        <label>Service area</label>
        <input value={f.serviceArea} onChange={set('serviceArea')} placeholder="e.g. Bluffton / Hilton Head, SC" />
        <label>Description</label>
        <textarea value={f.description} onChange={set('description')} />
        <label>Service categories <span className="p-muted">(select up to 5)</span></label>
        <div className="cat-grid" style={{ marginBottom: 16 }}>
          {SERVICE_CATEGORIES.map((c) => (
            <label key={c} className={`cat ${cats.includes(c) ? 'on' : ''}`}>
              {c}
              <input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(c)} />
            </label>
          ))}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="pbtn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="pbtn" style={{ flex: 1 }} onClick={save} disabled={!f.company || !f.email}>Save</button>
        </div>
      </div>
    </div>
  )
}
