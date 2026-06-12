import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { createRequest } from '../data'
import { OwnerNav, Screen, Toast, useToast } from '../components'
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
    // Confirmation ping to the owner; the operator gets their own push via the store.
    await pushLocal({
      title: 'Request received',
      body: `We’ve got your "${category}" request and will be in touch.`,
      url: '/owner',
    })
    show('Request sent to your concierge')
    setTimeout(() => navigate('/owner'), 900)
  }

  return (
    <Screen nav={<OwnerNav />}>
      <p className="script">how can we help?</p>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>New Concierge Request</h1>

      <div className="card">
        <label>Service</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label>Details</label>
        <textarea
          placeholder="Tell us what you need — dates, preferences, anything specific…"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        <button className="btn" disabled={!details.trim() || sending} onClick={submit}>
          {sending ? 'Sending…' : 'Send request'}
        </button>
      </div>

      <p className="muted" style={{ fontSize: 13, textAlign: 'center' }}>
        Your concierge is notified instantly and will follow up by text, email, or phone.
      </p>
      <Toast msg={msg} />
    </Screen>
  )
}
