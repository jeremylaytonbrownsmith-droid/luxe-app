import { useState } from 'react'
import { ProLayout } from './ProLayout'
import { getClients, getProperty, upsertClient, useStore } from '../data'
import { fmtDate, initials } from '../components'
import type { Client } from '../types'

export default function Clients() {
  const clients = useStore(() => getClients())
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Client | 'new' | null>(null)
  const [selected, setSelected] = useState<Client | null>(null)

  const filtered = clients.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <ProLayout
      title="Clients"
      subtitle="Homeowners you serve and invite to the app."
      actions={
        <>
          <div className="pro-search">
            🔎<input placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="pbtn sm" onClick={() => setEditing('new')}>+ New Client</button>
        </>
      }
    >
      <div className="list-head" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 0.8fr' }}>
        <span>Name</span><span>Property</span><span>Contact</span><span>Updated</span><span>Status</span>
      </div>
      {filtered.map((c) => {
        const prop = getProperty(c.propertyId)
        return (
          <div key={c.id} className="prow" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 0.8fr' }}
            onClick={() => setSelected(c)}>
            <div className="who">
              {c.photoUrl ? <img src={c.photoUrl} alt="" /> :
                <div className="pro-avatar" style={{ background: '#eef1f4', color: '#6b7785', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{initials(c.firstName, c.lastName)}</div>}
              <span className="nm">{c.firstName} {c.lastName}</span>
            </div>
            <span className="p-muted" style={{ fontSize: 13 }}>{prop ? prop.name : 'Unassigned'}</span>
            <span className="p-muted" style={{ fontSize: 13 }}>{c.email}</span>
            <span className="p-muted" style={{ fontSize: 13 }}>{fmtDate(c.updatedAt)}</span>
            <span className={`ppill ${c.inviteStatus}`}>{c.inviteStatus}</span>
          </div>
        )
      })}
      {filtered.length === 0 && <p className="p-muted" style={{ padding: 24 }}>No clients found.</p>}

      {selected && <ClientDetail client={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null) }} />}
      {editing && <ClientForm client={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </ProLayout>
  )
}

function ClientDetail({ client, onClose, onEdit }: { client: Client; onClose: () => void; onEdit: () => void }) {
  const prop = getProperty(client.propertyId)
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ textAlign: 'left', maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: 14 }}>
          <div className="who" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {client.photoUrl ? <img src={client.photoUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} /> :
              <div className="pro-avatar" style={{ width: 48, height: 48, background: '#1d4e6b', color: '#c5a74e', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{initials(client.firstName, client.lastName)}</div>}
            <div>
              <h3 style={{ fontSize: 18 }}>{client.firstName} {client.lastName}</h3>
              <span className={`ppill ${client.inviteStatus}`}>{client.inviteStatus}</span>
            </div>
          </div>
          <button className="pbtn ghost sm" onClick={onEdit}>Edit</button>
        </div>
        <Detail label="Phone" value={client.phone} />
        <Detail label="Email" value={client.email} />
        {client.birthday && <Detail label="Birthday" value={fmtDate(client.birthday)} />}
        {client.anniversary && <Detail label="Anniversary" value={fmtDate(client.anniversary)} />}
        <Detail label="Property" value={prop ? `${prop.name} · ${prop.address}` : 'Unassigned'} />
        <button className="pbtn ghost" style={{ width: '100%', marginTop: 14 }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--p-line)' }}>
      <span className="p-muted" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function ClientForm({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const [f, setF] = useState({
    firstName: client?.firstName ?? '',
    lastName: client?.lastName ?? '',
    phone: client?.phone ?? '',
    email: client?.email ?? '',
    birthday: client?.birthday ?? '',
    anniversary: client?.anniversary ?? '',
  })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const save = () => {
    if (!f.firstName || !f.lastName) return
    upsertClient({ id: client?.id, ...f, propertyId: client?.propertyId })
    onClose()
  }
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ textAlign: 'left', maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>{client ? 'Edit Client' : 'New Client'}</h3>
        <div className="field-grid">
          <div><label>First name *</label><input value={f.firstName} onChange={set('firstName')} /></div>
          <div><label>Last name *</label><input value={f.lastName} onChange={set('lastName')} /></div>
        </div>
        <div className="field-grid">
          <div><label>Phone</label><input value={f.phone} onChange={set('phone')} /></div>
          <div><label>Email</label><input value={f.email} onChange={set('email')} /></div>
        </div>
        <div className="field-grid">
          <div><label>Birthday</label><input type="date" value={f.birthday} onChange={set('birthday')} /></div>
          <div><label>Anniversary</label><input type="date" value={f.anniversary} onChange={set('anniversary')} /></div>
        </div>
        <div className="row" style={{ marginTop: 8, gap: 10 }}>
          <button className="pbtn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="pbtn" style={{ flex: 1 }} onClick={save} disabled={!f.firstName || !f.lastName}>Save</button>
        </div>
      </div>
    </div>
  )
}
