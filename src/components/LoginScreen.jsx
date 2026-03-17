import { useState } from 'react'

export function LoginScreen({ onParentLogin, onKidLogin, onNewFamily }) {
  const [email,  setEmail]  = useState('')
  const [pw,     setPw]     = useState('')
  const [err,    setErr]    = useState('')
  const [loading, setLoading] = useState(false)
  const [shake,  setShake]  = useState(false)

  const handleLogin = async () => {
    if (!email || !pw) { setErr('Enter your email and password'); return }
    setLoading(true)
    try {
      await onParentLogin({ email, password: pw })
    } catch (e) {
      setErr(e.message || 'Login failed')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ fontSize: 56, marginBottom: 6 }}>🏆</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 38, color: 'white', marginBottom: 4 }}>ChoreQuest</div>
      <div style={{ color: '#475569', fontSize: 14, fontWeight: 600, marginBottom: 36 }}>Earn. Save. Level Up.</div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Parent login */}
        <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white', marginBottom: 16 }}>👨‍👩‍👧 Parent Login</div>
          <div style={{ marginBottom: 12 }}>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }} placeholder="Email address"
              style={{ width: '100%', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 12, padding: '12px 14px', color: 'white', fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ animation: shake ? 'shake 0.4s ease' : 'none', marginBottom: err ? 8 : 14 }}>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr('') }} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Password"
              style={{ width: '100%', background: '#0f172a', border: err ? '2px solid #ef4444' : '1.5px solid #334155', borderRadius: 12, padding: '12px 14px', color: 'white', fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {err && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{err}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 12, padding: 13, fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : "Let's Go! 🚀"}
          </button>
        </div>

        {/* Kid login */}
        <button onClick={onKidLogin} style={{ width: '100%', background: 'linear-gradient(160deg,#fef3c7,#fde68a)', border: 'none', borderRadius: 18, padding: '16px 18px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{ fontSize: 30 }}>👧</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#92400e' }}>I'm a Kid</div>
            <div style={{ fontSize: 12, color: '#b45309' }}>Log in with your PIN</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 18 }}>→</span>
        </button>

        {/* New family */}
        <button onClick={onNewFamily} style={{ width: '100%', background: 'transparent', border: '1.5px solid #334155', borderRadius: 14, padding: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, color: '#64748b', cursor: 'pointer' }}>
          🏠 New Family? Set up here →
        </button>
      </div>
    </div>
  )
}
