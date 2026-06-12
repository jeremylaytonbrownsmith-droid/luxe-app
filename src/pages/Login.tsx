import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { isDemo } from '../firebase'
import { BRAND_LOGO } from '../brand'

export default function Login() {
  const { loginAs } = useAuth()
  const navigate = useNavigate()

  const enter = (role: 'owner' | 'pro') => {
    loginAs(role)
    navigate(role === 'owner' ? '/owner' : '/pro', { replace: true })
  }

  return (
    <div className="center fade-in">
      <div style={{ marginBottom: 36 }}>
        <img
          src={BRAND_LOGO}
          alt="Local Luxe Concierge"
          style={{ width: 220, maxWidth: '78vw', borderRadius: 18, display: 'block', boxShadow: '0 18px 40px rgba(0,0,0,0.35)' }}
        />
      </div>

      <p className="script" style={{ marginBottom: 10 }}>welcome</p>
      <h1 style={{ fontSize: 26, textAlign: 'center', marginBottom: 8 }}>Your home, watched with care.</h1>
      <p className="muted" style={{ textAlign: 'center', maxWidth: 360, marginBottom: 34 }}>
        Sign in to view your home watch reports, track upcoming visits, and request concierge service.
      </p>

      <div style={{ width: '100%', maxWidth: 340 }} className="stack">
        <button className="btn" onClick={() => enter('owner')}>Enter as Homeowner</button>
        <button className="btn secondary" onClick={() => enter('pro')}>Enter as Local Luxe Team</button>
      </div>

      {isDemo && (
        <p className="muted" style={{ fontSize: 12, marginTop: 28, textAlign: 'center', maxWidth: 320 }}>
          Demo mode — running on sample data, no account required. Add Firebase keys in <code>.env</code> to go live.
        </p>
      )}
    </div>
  )
}
