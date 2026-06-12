import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addPhoto,
  completeVisit,
  getProperty,
  getVisit,
  setCheckItem,
  startVisit,
  useStore,
} from '../data'
import { OperatorNav, Screen, Toast, useToast } from '../components'
import { pushLocal } from '../notifications'

export default function Inspection() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { msg, show } = useToast()
  const visit = useStore(() => getVisit(id))
  const property = useStore(() => getProperty(visit?.propertyId))
  const [summary, setSummary] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!visit) {
    return (
      <Screen nav={<OperatorNav />}>
        <div className="empty">Visit not found.</div>
      </Screen>
    )
  }

  if (visit.status === 'scheduled') startVisit(visit.id)

  const checkedCount = visit.checklist.filter((c) => c.ok !== null).length
  const allChecked = checkedCount === visit.checklist.length

  // Reads a chosen image file into a data URL so it persists in the demo store.
  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () =>
      addPhoto(visit.id, { caption: file.name.replace(/\.[^.]+$/, ''), dataUrl: String(reader.result) })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const submit = async () => {
    setSubmitting(true)
    completeVisit(visit.id, summary.trim() || 'All systems normal. No issues found during this visit.')
    // Real system notification to demonstrate the owner-facing push.
    await pushLocal({
      title: '✓ Your home was checked today',
      body: 'Your home watch report with photos is ready to view.',
      url: `/owner/report/${visit.id}`,
    })
    show('Report sent — owner notified')
    setTimeout(() => navigate('/operator'), 1000)
  }

  return (
    <Screen nav={<OperatorNav />}>
      <button className="btn sm ghost" style={{ marginBottom: 14 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <p className="script">inspection</p>
      <h1 style={{ fontSize: 22, marginBottom: 2 }}>{property?.address}</h1>
      <p className="muted" style={{ marginBottom: 16 }}>{property?.community}</p>

      <div className="card">
        <div className="row" style={{ marginBottom: 6 }}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>Checklist</div>
          <span className="muted" style={{ fontSize: 13 }}>{checkedCount}/{visit.checklist.length}</span>
        </div>
        {visit.checklist.map((c) => (
          <div key={c.key} className="check">
            <span className="label">{c.label}</span>
            <div className="toggle">
              <button
                className={`yes ${c.ok === true ? 'active' : ''}`}
                onClick={() => setCheckItem(visit.id, c.key, true)}
                aria-label="OK"
              >
                ✓
              </button>
              <button
                className={`no ${c.ok === false ? 'active' : ''}`}
                onClick={() => {
                  const note = prompt(`Note for "${c.label}":`, c.note || '') || undefined
                  setCheckItem(visit.id, c.key, false, note)
                }}
                aria-label="Flag"
              >
                !
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>Photos</div>
          <label className="btn sm" style={{ width: 'auto', marginBottom: 0 }}>
            + Add photo
            <input type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} />
          </label>
        </div>
        {visit.photos.length === 0 ? (
          <p className="muted" style={{ fontSize: 14 }}>No photos yet.</p>
        ) : (
          <div className="photos">
            {visit.photos.map((p) => (
              <div key={p.id} className="photo">
                <img src={p.dataUrl} alt={p.caption} />
                <div className="cap">{p.caption}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <label>Visit summary</label>
        <textarea
          placeholder="Notes for the homeowner…"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <button className="btn" disabled={!allChecked || submitting} onClick={submit}>
          {submitting ? 'Sending…' : allChecked ? 'Complete & notify owner' : `Check all items (${checkedCount}/${visit.checklist.length})`}
        </button>
      </div>
      <Toast msg={msg} />
    </Screen>
  )
}
