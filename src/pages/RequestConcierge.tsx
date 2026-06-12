import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OwnerLayout } from '../Shell'
import { useAuth } from '../auth'
import { createRequest } from '../data'
import { Toast, useToast } from '../components'
import { pushLocal } from '../notifications'

const CATEGORIES = [
  'Dining / Reservations',
  'Travel arrangements',
  'Errands & shopping',
  'Vendor coordination',
  'Transportation',
  'Tech / digital help',
  'Other',
]

export default function RequestConcierge() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { msg, show } = useToast()
  const [category, setCategory] = useState(CATEGORIES[0])
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!user?.propertyId || !details.trim()) return
    setSending(true)
    createRequest(user.propertyId, user.name, category, details.trim())
    await pushLocal({ title: 'Request received', body: `We’ve got your "${category}" request and will be in touch.`, url: '/owner' })
    show('Request sent to your concierge')
    setTimeout(() => navigate('/owner'), 900)
  }

  return (
    <OwnerLayout title="New Concierge Request" subtitle="Tell us how we can help.">
      <div className="p-grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="pcard">
          <label>Service</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label>Details</label>
          <textarea placeholder="Tell us what you need — dates, preferences, anything specific…" value={details} onChange={(e) => setDetails(e.target.value)} />
          <button className="pbtn" style={{ width: '100%' }} disabled={!details.trim() || sending} onClick={submit}>
            {sending ? 'Sending…' : 'Send request'}
          </button>
        </div>
        <div className="pcard" style={{ alignSelf: 'start' }}>
          <div className="p-eyebrow" style={{ marginBottom: 8 }}>What happens next</div>
          <p className="p-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
            Your concierge is notified instantly and will follow up by text, email, or phone to confirm the details and take care of it.
          </p>
        </div>
      </div>
      <Toast msg={msg} />
    </OwnerLayout>
  )
}
