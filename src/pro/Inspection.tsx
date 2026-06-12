import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProLayout } from './ProLayout'
import {
  addPhoto,
  completeVisit,
  getProperty,
  getVisit,
  setCheckItem,
  startVisit,
  useStore,
} from '../data'
import { pushLocal } from '../notifications'

export default function Inspection() {
  const { id = '' } = useParams()
  const visit = useStore(() => getVisit(id))
  const property = useStore(() => getProperty(visit?.propertyId))
  const navigate = useNavigate()
  const [summary, setSummary] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!visit) {
    return <ProLayout title="Inspection"><p className="p-muted">Visit not found.</p></ProLayout>
  }

  const completed = visit.status === 'completed'
  if (visit.status === 'scheduled') startVisit(visit.id)

  const checkedCount = visit.checklist.filter((c) => c.ok !== null).length
  const allChecked = checkedCount === visit.checklist.length
  const issues = visit.checklist.filter((c) => c.ok === false)

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => addPhoto(visit.id, { caption: file.name.replace(/\.[^.]+$/, ''), dataUrl: String(reader.result) })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const submit = async () => {
    setSubmitting(true)
    completeVisit(visit.id, summary.trim() || 'All systems normal. No issues found during this visit.')
    await pushLocal({
      title: '✓ Your home was checked today',
      body: 'Your home watch report with photos is ready to view.',
      url: `/owner/report/${visit.id}`,
    })
    setTimeout(() => navigate('/pro/visits'), 900)
  }

  return (
    <ProLayout
      title={`Inspection — ${property?.name ?? ''}`}
      subtitle={property?.community}
      actions={<button className="pbtn ghost sm" onClick={() => navigate(-1)}>← Back</button>}
    >
      <div className="p-grid main">
        <div className="pcard">
          <div className="row" style={{ marginBottom: 8 }}>
            <h3>Checklist</h3>
            <span className="p-muted" style={{ fontSize: 13 }}>{checkedCount}/{visit.checklist.length}</span>
          </div>
          {visit.checklist.map((c) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--p-line)' }}>
              <span style={{ flex: 1, fontSize: 14 }}>{c.label}{c.note && <span className="p-muted" style={{ display: 'block', fontSize: 12 }}>{c.note}</span>}</span>
              {completed ? (
                <span className={`ppill ${c.ok === false ? 'pending' : 'done'}`}>{c.ok === false ? 'Note' : 'OK'}</span>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className={`pbtn ${c.ok === true ? '' : 'ghost'} sm`} onClick={() => setCheckItem(visit.id, c.key, true)}>✓</button>
                  <button className={`pbtn ${c.ok === false ? 'gold' : 'ghost'} sm`} onClick={() => {
                    const note = prompt(`Note for "${c.label}":`, c.note || '') || undefined
                    setCheckItem(visit.id, c.key, false, note)
                  }}>!</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <div className="pcard">
            <div className="row" style={{ marginBottom: 12 }}>
              <h3>Photos</h3>
              {!completed && (
                <label className="pbtn ghost sm" style={{ marginBottom: 0 }}>
                  + Add
                  <input type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} />
                </label>
              )}
            </div>
            {visit.photos.length === 0 ? (
              <p className="p-muted" style={{ fontSize: 14 }}>No photos yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {visit.photos.map((p) => (
                  <div key={p.id} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--p-line)' }}>
                    <img src={p.dataUrl} alt={p.caption} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                    <div className="p-muted" style={{ fontSize: 11, padding: '6px 8px' }}>{p.caption}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!completed ? (
            <div className="pcard" style={{ marginTop: 16 }}>
              <label>Visit summary</label>
              <textarea placeholder="Notes for the homeowner…" value={summary} onChange={(e) => setSummary(e.target.value)} />
              <button className="pbtn" style={{ width: '100%' }} disabled={!allChecked || submitting} onClick={submit}>
                {submitting ? 'Sending…' : allChecked ? 'Complete & notify owner' : `Check all items (${checkedCount}/${visit.checklist.length})`}
              </button>
            </div>
          ) : (
            <div className="pcard" style={{ marginTop: 16 }}>
              <div className="p-eyebrow" style={{ marginBottom: 6 }}>Summary</div>
              <p style={{ fontSize: 14 }}>{visit.summary}</p>
              {issues.length > 0 && <p className="ppill pending" style={{ marginTop: 10, display: 'inline-flex' }}>{issues.length} item(s) flagged</p>}
            </div>
          )}
        </div>
      </div>
    </ProLayout>
  )
}
