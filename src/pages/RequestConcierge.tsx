import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OwnerLayout } from '../Shell'
import { useAuth } from '../auth'
import { createRequest } from '../data'
import { Toast, useToast } from '../components'
import { Icon } from '../icons'
import { pushLocal } from '../notifications'
import type { Photo } from '../types'

const CATEGORIES = [
  'Dining / Reservations',
  'Travel arrangements',
  'Errands & shopping',
  'Vendor coordination',
  'Transportation',
  'Tech / digital help',
  'Key-holder / access',
  'Lifestyle / other',
]

const uid = () => Math.random().toString(36).slice(2, 10)

export default function RequestConcierge() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { msg, show } = useToast()
  const [category, setCategory] = useState(CATEGORIES[0])
  const [details, setDetails] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [sending, setSending] = useState(false)

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () =>
        setPhotos((prev) => [...prev, { id: uid(), caption: file.name.replace(/\.[^.]+$/, ''), dataUrl: String(reader.result) }])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const submit = async () => {
    if (!user?.propertyId || !details.trim()) return
    setSending(true)
    createRequest(user.propertyId, user.name, category, details.trim(), photos)
    await pushLocal({ title: 'Request received', body: `We’ve got your "${category}" request and will be in touch.`, url: '/owner' })
    show('Request sent to your concierge')
    setTimeout(() => navigate('/owner'), 900)
  }

  return (
    <OwnerLayout title="New Concierge Request" subtitle="Tell us how we can help.">
      <div className="p-grid main">
        <div className="pcard">
          <label>Service</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label>Details</label>
          <textarea placeholder="Tell us what you need — dates, preferences, anything specific…" value={details} onChange={(e) => setDetails(e.target.value)} />

          <label>Photos (optional)</label>
          <p className="p-muted" style={{ fontSize: 13, marginTop: -6, marginBottom: 10 }}>Add a picture of what you’d like done.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            {photos.map((p) => (
              <div key={p.id} style={{ position: 'relative', width: 88, height: 88, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--p-line)' }}>
                <img src={p.dataUrl} alt={p.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}
                  style={{ position: 'absolute', top: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 13 }}
                  aria-label="Remove"
                >×</button>
              </div>
            ))}
            <label className="pbtn ghost sm" style={{ width: 88, height: 88, flexDirection: 'column', gap: 4, marginBottom: 0 }}>
              <Icon name="plus" size={18} />
              <span style={{ fontSize: 11 }}>Add photo</span>
              <input type="file" accept="image/*" capture="environment" multiple hidden onChange={onPhoto} />
            </label>
          </div>

          <button className="pbtn" style={{ width: '100%' }} disabled={!details.trim() || sending} onClick={submit}>
            {sending ? 'Sending…' : 'Send request'}
          </button>
        </div>
        <div className="pcard" style={{ alignSelf: 'start' }}>
          <div className="p-eyebrow" style={{ marginBottom: 8 }}>What happens next</div>
          <p className="p-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
            Your concierge is notified instantly and will follow up by text, email, or phone. When the job’s done, they’ll attach a photo of the finished result right here.
          </p>
        </div>
      </div>
      <Toast msg={msg} />
    </OwnerLayout>
  )
}
