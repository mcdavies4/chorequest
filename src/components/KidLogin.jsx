import { useState } from 'react'

export function KidLogin({ kids, onLogin, onBack }) {
  const [selected, setSelected] = useState(null)
  const [pin,      setPin]      = useState('')
  const [err,      setErr]      = useState('')
  const [shake,    setShake]    = useState(false)

  const handleLogin = () => {
    if (!selected) return
    if (pin === selected.pin) { onLogin(selected) }
    else { setErr('Wrong PIN! Try again.'); setShake(true); setTimeout(() => setShake(false), 500) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#fef3c7 0%,#fde68a 50%,#fed7aa 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ fontSize: 52, marginBottom: 6 }}>🏆</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 30, color: '#92400e', marginBottom: 4 }}>Who are you?</div>
      <div style={{ color: '#b45309', fontSize: 14, fontWeight: 600, marginBottom: 28 }}>Pick your avatar to log in</div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {kids.map(kid => (
            <button key={kid.id} onClick={() => { setSelected(kid); setPin(''); setErr('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: selected?.id === kid.id ? '#f59e0b' : 'white', border: selected?.id === kid.id ? 'none' : '2px solid #fde68a', borderRadius: 18, padding: '13px 18px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", color: '#1e293b', transition: 'all 0.2s', textAlign: 'left', boxShadow: '0 2px 12px #f59e0b22' }}>
              <span style={{ fontSize: 34 }}>{kid.avatar}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{kid.name}</div><div style={{ fontSize: 12, opacity: 0.6 }}>Age {kid.age}</div></div>
              {selected?.id === kid.id && <span style={{ fontSize: 20 }}>✓</span>}
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ color: '#92400e', fontSize: 12, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Enter your PIN</div>
            <div style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}>
              <input type="password" value={pin} onChange={e => { setPin(e.target.value); setErr('') }} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Your secret PIN"
                style={{ width: '100%', background: 'white', border: err ? '2px solid #ef4444' : '2px solid #fde68a', borderRadius: 14, padding: '13px 16px', color: '#1e293b', fontSize: 15, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {err && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 5 }}>{err}</div>}
            <button onClick={handleLogin} style={{ width: '100%', marginTop: 12, background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 14, padding: 14, fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'white', cursor: 'pointer', boxShadow: '0 4px 20px #f59e0b55' }}>
              Let's Go! 🚀
            </button>
          </div>
        )}

        <button onClick={onBack} style={{ width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: '#b45309', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
          ← Parent login
        </button>
      </div>
    </div>
  )
}
