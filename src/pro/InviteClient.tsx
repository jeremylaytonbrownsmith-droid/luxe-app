import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProLayout } from './ProLayout'
import {
  getClients,
  getExperts,
  getProperty,
  inviteClient,
  upsertClient,
  useStore,
} from '../data'
import { pushLocal } from '../notifications'
import { Icon } from '../icons'

export default function InviteClient() {
  const { id = '' } = useParams()
  const property = useStore(() => getProperty(id))
  const clients = useStore(() => getClients())
  const experts = useStore(() => getExperts())
  const navigate = useNavigate()

  const [clientId, setClientId] = useState(property?.clientId ?? '')
  const [salePrice, setSalePrice] = useState<string>(property?.salePrice ? String(property.salePrice) : '')
  const [docIds, setDocIds] = useState<string[]>(property?.sharedDocIds ?? [])
  const [expertIds, setExpertIds] = useState<string[]>(property?.sharedExpertIds ?? [])
  const [sent, setSent] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState({ first: '', last: '', phone: '', email: '' })

  if (!property) {
    return <ProLayout title="Invite Client"><p className="p-muted">Property not found.</p></ProLayout>
  }

  const docs = property.documents
  const allDocs = docs.length > 0 && docIds.length === docs.length
  const allExperts = experts.length > 0 && expertIds.length === experts.length
  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])

  const send = async () => {
    let cid = clientId
    if (adding && newName.first) {
      const c = upsertClient({
        firstName: newName.first,
        lastName: newName.last,
        phone: newName.phone,
        email: newName.email,
      })
      cid = c.id
    }
    if (!cid) return
    const client = inviteClient({
      propertyId: property.id,
      clientId: cid,
      salePrice: salePrice ? Number(salePrice) : undefined,
      sharedDocIds: docIds,
      sharedExpertIds: expertIds,
    })
    const name = client ? `${client.firstName} ${client.lastName}` : 'your client'
    await pushLocal({
      title: 'Invitation sent',
      body: `${name} was invited to Local Luxe.`,
      url: '/pro/clients',
    })
    setSent(name)
  }

  return (
    <ProLayout
      title={property.name}
      subtitle="Invite a client to their Local Luxe home portal"
      actions={
        <>
          <button className="pbtn ghost sm" onClick={() => navigate(-1)}>Cancel</button>
          <button className="pbtn sm" onClick={send} disabled={!clientId && !(adding && newName.first)}>Send Invite</button>
        </>
      }
    >
      {/* 1. Client + sale */}
      <div className="pcard">
        <div className="p-eyebrow" style={{ marginBottom: 4 }}>1. Client & details</div>
        <p className="p-muted" style={{ fontSize: 13, marginBottom: 14 }}>Assign a client to receive Local Luxe access.</p>
        {!adding ? (
          <div className="field-grid">
            <div>
              <label>Select client <button className="link-add" style={{ background: 'none', color: 'var(--p-teal)', fontWeight: 700, fontSize: 12 }} onClick={() => setAdding(true)}>+ Add new</button></label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">Choose…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div><label>Value / sale price</label><input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="$" /></div>
          </div>
        ) : (
          <>
            <div className="field-grid">
              <div><label>First name</label><input value={newName.first} onChange={(e) => setNewName({ ...newName, first: e.target.value })} /></div>
              <div><label>Last name</label><input value={newName.last} onChange={(e) => setNewName({ ...newName, last: e.target.value })} /></div>
            </div>
            <div className="field-grid">
              <div><label>Phone</label><input value={newName.phone} onChange={(e) => setNewName({ ...newName, phone: e.target.value })} /></div>
              <div><label>Email</label><input value={newName.email} onChange={(e) => setNewName({ ...newName, email: e.target.value })} /></div>
            </div>
            <button className="pbtn ghost sm" onClick={() => setAdding(false)}>Use existing client instead</button>
          </>
        )}
      </div>

      {/* 2. Share documents */}
      <div className="pcard">
        <div className="row" style={{ marginBottom: 10 }}>
          <div>
            <div className="p-eyebrow">2. Share key documents</div>
            <p className="p-muted" style={{ fontSize: 13, marginTop: 4 }}>These appear in the client’s home portal.</p>
          </div>
          <label className="share-row" style={{ padding: '6px 10px' }}>
            <input type="checkbox" checked={allDocs} onChange={() => setDocIds(allDocs ? [] : docs.map((d) => d.id))} />
            Share all
          </label>
        </div>
        {docs.length === 0 ? (
          <p className="p-muted" style={{ fontSize: 13 }}>No documents on this property yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {docs.map((d) => (
              <label key={d.id} className={`share-row ${docIds.includes(d.id) ? 'on' : ''}`}>
                <input type="checkbox" checked={docIds.includes(d.id)} onChange={() => toggle(docIds, setDocIds, d.id)} />
                <span style={{ color: 'var(--sage-deep)' }}><Icon name="document" size={18} /></span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 3. Share experts */}
      <div className="pcard">
        <div className="row" style={{ marginBottom: 10 }}>
          <div>
            <div className="p-eyebrow">3. Share trusted experts</div>
            <p className="p-muted" style={{ fontSize: 13, marginTop: 4 }}>Shown to the client as “Recommended by Local Luxe.”</p>
          </div>
          <label className="share-row" style={{ padding: '6px 10px' }}>
            <input type="checkbox" checked={allExperts} onChange={() => setExpertIds(allExperts ? [] : experts.map((e) => e.id))} />
            Share all
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {experts.map((e) => (
            <label key={e.id} className={`share-row ${expertIds.includes(e.id) ? 'on' : ''}`}>
              <input type="checkbox" checked={expertIds.includes(e.id)} onChange={() => toggle(expertIds, setExpertIds, e.id)} />
              {e.logoUrl && <img src={e.logoUrl} alt="" style={{ width: 30, height: 30, borderRadius: 7 }} />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.company}</div>
                <div className="p-muted" style={{ fontSize: 11 }}>{e.categories.join(', ')}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {sent && (
        <div className="modal-bg" onClick={() => navigate('/pro/clients')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ color: 'var(--sage-deep)', display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icon name="mail" size={40} /></div>
            <h3 style={{ marginBottom: 8 }}>Invitation sent to {sent}</h3>
            <p className="p-muted" style={{ fontSize: 14, marginBottom: 18 }}>
              They’ll get a text with a download link and verification code to get started.
            </p>
            <button className="pbtn navy" style={{ width: '100%' }} onClick={() => navigate('/pro/clients')}>Continue</button>
          </div>
        </div>
      )}
    </ProLayout>
  )
}
