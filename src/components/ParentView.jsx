import { useState } from 'react'
import { ProgressBar, CHORE_ICONS } from './shared'

function WeeklySummary({ kid }) {
  const history = kid.weekly_history ?? kid.weeklyHistory ?? []
  const [sel, setSel] = useState(0)
  if (!history.length) return <div style={{ color: '#475569', fontWeight: 700, padding: 20, textAlign: 'center' }}>No history yet — check back after the first week!</div>
  const w = history[sel]
  const completed  = Number(w.chores_completed ?? w.choresCompleted ?? 0)
  const total      = Number(w.total_chores     ?? w.totalChores     ?? 1)
  const pct        = total > 0 ? Math.round((completed / total) * 100) : 0
  const maxEarned  = Math.max(...history.map(h => Number(h.earned)), 0.01)

  const statBox = (icon, val, label, color) => (
    <div style={{ background: '#0f172a', border: `1.5px solid ${color}44`, borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color }}>{val}</div>
      <div style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>{label}</div>
    </div>
  )
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 44 }}>{kid.avatar}</div>
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'white' }}>{kid.name}'s Report</div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>🔥 {kid.streak ?? 0}-day streak · 🪙 ${Number(kid.balance ?? 0).toFixed(2)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {history.map((h, i) => <button key={i} onClick={() => setSel(i)} style={{ flexShrink: 0, background: sel === i ? '#f59e0b' : '#1e293b', border: sel === i ? 'none' : '1.5px solid #334155', borderRadius: 12, padding: '7px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: sel === i ? '#1e293b' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>{h.week_label ?? h.week}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {statBox('🪙', `$${Number(w.earned).toFixed(2)}`, 'Earned', '#f59e0b')}
        {statBox('✅', `${completed}/${total}`, 'Completed', '#22c55e')}
        {statBox('💸', Number(w.redeemed) > 0 ? `$${Number(w.redeemed).toFixed(2)}` : '—', 'Redeemed', '#f472b6')}
      </div>
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>Completion Rate</span>
          <span style={{ fontWeight: 800, color: pct === 100 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#ef4444', fontSize: 13 }}>{pct}%</span>
        </div>
        <ProgressBar value={completed} max={total} color={pct === 100 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#ef4444'} />
        <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', fontWeight: 600 }}>⭐ Top chore: {w.top_chore ?? w.topChore ?? '—'}</div>
      </div>
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: 'white', fontSize: 13, marginBottom: 12 }}>📈 Earnings — Last 4 Weeks</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 70 }}>
          {history.map((h, i) => {
            const barH = Math.max(Math.round((Number(h.earned) / maxEarned) * 60), 4)
            const active = i === sel
            return (
              <div key={i} onClick={() => setSel(i)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <div style={{ fontSize: 10, color: active ? '#f59e0b' : '#475569', fontWeight: 800 }}>${Number(h.earned).toFixed(2)}</div>
                <div style={{ width: '100%', height: barH, background: active ? '#f59e0b' : '#334155', borderRadius: '6px 6px 0 0', transition: 'all 0.4s cubic-bezier(.34,1.56,.64,1)' }} />
                <div style={{ fontSize: 9, color: active ? '#f59e0b' : '#334155', fontWeight: 800, textAlign: 'center' }}>{(h.week_label ?? h.week ?? '').replace(' Week','').replace(' Weeks Ago','wk').replace('This','Now').replace('Last','-1')}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 16px' }}>
        <div style={{ fontWeight: 800, color: 'white', fontSize: 13, marginBottom: 10 }}>🏅 Badges Earned</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(kid.badges || ['⭐ Just Started']).map((b, i) => <div key={i} style={{ background: '#0f172a', border: '1.5px solid #f59e0b44', borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{b}</div>)}
        </div>
      </div>
    </div>
  )
}

function Leaderboard({ kids }) {
  const [metric, setMetric] = useState('streak')
  const metrics = [
    { key: 'streak',  label: '🔥 Streak',   getValue: k => k.streak ?? 0,                                                                           fmt: v => `${v}d`,            color: '#f97316' },
    { key: 'balance', label: '🪙 Balance',  getValue: k => Number(k.balance ?? 0),                                                                   fmt: v => `$${v.toFixed(2)}`, color: '#f59e0b' },
    { key: 'done',    label: '✅ Done',      getValue: k => { const c = k.chores||[]; return c.length ? c.filter(x=>x.done).length/c.length : 0 },   fmt: v => `${Math.round(v*100)}%`, color: '#22c55e' },
    { key: 'goal',    label: '🎯 Goal',      getValue: k => { const s=Number(k.goal_saved??k.savedGoal?.saved??0); const t=Number(k.goal_target??k.savedGoal?.target??1); return s/t }, fmt: v => `${Math.round(v*100)}%`, color: '#818cf8' },
    { key: 'earned',  label: '📈 This Week', getValue: k => { const h=k.weekly_history??k.weeklyHistory??[]; return Number(h[0]?.earned??0) },        fmt: v => `$${v.toFixed(2)}`, color: '#38bdf8' },
  ]
  const cur    = metrics.find(m => m.key === metric)
  const ranked = [...kids].sort((a,b) => cur.getValue(b) - cur.getValue(a))
  const maxVal = Math.max(...kids.map(cur.getValue), 0.01)
  const MEDALS = ['🥇','🥈','🥉']

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {metrics.map(m => <button key={m.key} onClick={() => setMetric(m.key)} style={{ background: metric===m.key ? m.color : '#1e293b', border: metric===m.key ? 'none' : '1.5px solid #334155', borderRadius: 99, padding: '6px 13px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: metric===m.key ? '#1e293b' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>{m.label}</button>)}
      </div>
      <div style={{ background: '#1e293b', border: `2px solid ${cur.color}44`, borderRadius: 22, padding: '18px 16px', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: cur.color, marginBottom: 14, textAlign: 'center' }}>{cur.label} Leaderboard</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          {ranked.map((k, i) => {
            const val  = cur.getValue(k)
            const barH = maxVal > 0 ? 40 + Math.round((val/maxVal)*60) : 40
            return (
              <div key={k.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: cur.color }}>{cur.fmt(val)}</div>
                <div style={{ width: i===0?80:64, height: barH, background: i===0?cur.color:`${cur.color}55`, borderRadius: '10px 10px 0 0', transition: 'height 0.6s cubic-bezier(.34,1.56,.64,1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
                  <div style={{ fontSize: i===0?36:28 }}>{k.avatar}</div>
                </div>
                <div style={{ fontSize: 20 }}>{MEDALS[i]||'🏅'}</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'white' }}>{k.name}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1.5px solid #334155' }}><div style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>Full Rankings</div></div>
        {ranked.map((k, i) => {
          const val  = cur.getValue(k)
          const barW = maxVal > 0 ? (val/maxVal)*100 : 0
          return (
            <div key={k.id} style={{ padding: '12px 16px', borderBottom: i<ranked.length-1?'1.5px solid #0f172a':'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{MEDALS[i]||'🏅'}</div>
              <div style={{ fontSize: 28 }}>{k.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>{k.name}</span><span style={{ fontWeight: 800, color: cur.color, fontSize: 13 }}>{cur.fmt(val)}</span></div>
                <div style={{ background: '#0f172a', borderRadius: 99, height: 6, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 99, background: i===0?cur.color:`${cur.color}77`, width: `${barW}%`, transition: 'width 0.6s cubic-bezier(.34,1.56,.64,1)' }} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ManageTab({ kid, onSaveChore, onDeleteChore, onSaveGoal, showToast }) {
  const [choreForm,  setChoreForm]  = useState(null)
  const [goalForm,   setGoalForm]   = useState(null)
  const [iconPicker, setIconPicker] = useState(false)

  const formData   = choreForm === 'new' ? { title: '', coins: '', icon: '🧹' } : choreForm
  const goalName   = kid.goal_name   ?? kid.savedGoal?.name   ?? 'My Goal'
  const goalTarget = Number(kid.goal_target ?? kid.savedGoal?.target ?? 10)
  const goalSaved  = Number(kid.goal_saved  ?? kid.savedGoal?.saved  ?? 0)

  const inp = { width: '100%', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }
  const lbl = { fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }

  const saveChore = () => {
    if (!formData?.title?.trim()) { showToast('⚠️ Enter a chore title'); return }
    const coins = parseFloat(formData.coins)
    if (isNaN(coins) || coins <= 0) { showToast('⚠️ Enter a valid amount'); return }
    onSaveChore(kid.id, { ...formData, coins: +coins.toFixed(2), id: formData.id || Date.now(), done: false, pending: false })
    setChoreForm(null)
    showToast(formData.id ? '✏️ Chore updated!' : '✅ Chore added!')
  }

  const saveGoal = () => {
    if (!goalForm?.name?.trim()) { showToast('⚠️ Enter a goal name'); return }
    const target = parseFloat(goalForm.target)
    if (isNaN(target) || target <= 0) { showToast('⚠️ Enter a valid amount'); return }
    onSaveGoal(kid.id, { name: goalForm.name, target: +target.toFixed(2) })
    setGoalForm(null)
    showToast('🎯 Goal updated!')
  }

  return (
    <div>
      {/* Goal */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#f59e0b' }}>🎯 Savings Goal</div>
          {!goalForm && <button onClick={() => setGoalForm({ name: goalName, target: goalTarget })} style={{ background: '#f59e0b22', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#f59e0b', cursor: 'pointer' }}>✏️ Edit</button>}
        </div>
        {goalForm ? (
          <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 18, padding: 16 }}>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Goal Name</label><input style={inp} value={goalForm.name} onChange={e => setGoalForm(g => ({ ...g, name: e.target.value }))} placeholder="e.g. LEGO Set..." /></div>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Target Amount ($)</label><input style={inp} type="number" min="1" step="0.50" value={goalForm.target} onChange={e => setGoalForm(g => ({ ...g, target: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setGoalForm(null)} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveGoal} style={{ background: '#f59e0b', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#1e293b', cursor: 'pointer' }}>Save Goal 🎯</button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>{goalName}</span><span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 14 }}>${goalSaved.toFixed(2)} / ${goalTarget}</span></div>
            <ProgressBar value={goalSaved} max={goalTarget} />
            <div style={{ marginTop: 6, fontSize: 11, color: '#475569', fontWeight: 600 }}>${(goalTarget - goalSaved).toFixed(2)} to go</div>
          </div>
        )}
      </div>

      {/* Chores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#f59e0b' }}>⚡ Chores</div>
        <button onClick={() => { setChoreForm('new'); setIconPicker(false) }} style={{ background: '#22c55e22', border: '1.5px solid #22c55e', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#22c55e', cursor: 'pointer' }}>+ Add Chore</button>
      </div>

      {choreForm && (
        <div style={{ background: '#1e293b', border: '2px solid #818cf8', borderRadius: 18, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#818cf8', marginBottom: 12 }}>{formData?.id ? '✏️ Edit Chore' : '➕ New Chore'}</div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Icon</label>
            <button onClick={() => setIconPicker(p => !p)} style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: 12, padding: '10px 16px', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              {formData?.icon}<span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>tap to change</span>
            </button>
            {iconPicker && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, background: '#0f172a', borderRadius: 14, padding: 10 }}>
                {CHORE_ICONS.map(ic => <button key={ic} onClick={() => { setChoreForm(f => f === 'new' ? { title: '', coins: '', icon: ic } : { ...f, icon: ic }); setIconPicker(false) }} style={{ fontSize: 24, background: formData?.icon===ic?'#334155':'transparent', border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer' }}>{ic}</button>)}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}><label style={lbl}>Chore Title</label><input style={inp} value={formData?.title||''} onChange={e => setChoreForm(f => f==='new' ? {title:e.target.value,coins:'',icon:'🧹'} : {...f,title:e.target.value})} placeholder="e.g. Clean bathroom..." /></div>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Reward Amount ($)</label><input style={inp} type="number" min="0.25" step="0.25" value={formData?.coins||''} onChange={e => setChoreForm(f => f==='new' ? {...f,coins:e.target.value} : {...f,coins:e.target.value})} placeholder="e.g. 0.75" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => { setChoreForm(null); setIconPicker(false) }} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
            <button onClick={saveChore} style={{ background: '#818cf8', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'white', cursor: 'pointer' }}>Save ✓</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(kid.chores||[]).map(c => (
          <div key={c.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{c.title}</div><div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>🪙 ${Number(c.coins).toFixed(2)}</div></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { setChoreForm({...c}); setIconPicker(false) }} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '5px 9px', fontSize: 13, cursor: 'pointer' }}>✏️</button>
              <button onClick={() => onDeleteChore(kid.id, c.id)} style={{ background: '#ef444415', border: '1.5px solid #ef4444', borderRadius: 8, padding: '5px 9px', fontSize: 13, cursor: 'pointer' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ParentView({ data, onApprove, onReject, onLogout, onMarkRead, onSaveChore, onDeleteChore, onSaveGoal, showToast, activeKidId, setActiveKidId, plan = 'free', isPremium = false, familyId, userEmail }) {
  const [tab, setTab] = useState('home')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Pay link usernames — stored in localStorage so they persist
  const [cashTag,    setCashTag]    = useState(() => localStorage.getItem('cq_cashtag')    || '')
  const [paypalName, setPaypalName] = useState(() => localStorage.getItem('cq_paypal')     || '')
  const [venmoName,  setVenmoName]  = useState(() => localStorage.getItem('cq_venmo')      || '')
  const [editPay,    setEditPay]    = useState(false)

  const savePayLinks = () => {
    localStorage.setItem('cq_cashtag', cashTag)
    localStorage.setItem('cq_paypal',  paypalName)
    localStorage.setItem('cq_venmo',   venmoName)
    setEditPay(false)
    showToast('💸 Pay links saved!')
  }

  const kid = data.kids.find(k => k.id === activeKidId) || data.kids[0]

  // Show skeleton while kids are loading — happens on first login before data arrives
  if (!kid) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 100%)', fontFamily: "'Nunito',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48, animation: 'pulse 1.5s ease infinite' }}>🏆</div>
      <div style={{ color: '#475569', fontWeight: 700, fontSize: 14 }}>Loading your dashboard...</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )

  const pending      = (kid.chores||[]).filter(c => c.pending)
  const unread       = (data.notifications||[]).filter(n => !n.read).length
  const totalPending = data.kids.reduce((s,k) => s + (k.chores||[]).filter(c=>c.pending).length, 0)
  const goalName     = kid.goal_name   ?? kid.savedGoal?.name   ?? 'My Goal'
  const goalTarget   = Number(kid.goal_target ?? kid.savedGoal?.target ?? 10)
  const goalSaved    = Number(kid.goal_saved  ?? kid.savedGoal?.saved  ?? 0)

  const handleStartCheckout = async () => {
    if (!familyId || !userEmail) { showToast('❌ Missing account info'); return }
    setCheckoutLoading(true)
    try {
      // Dynamically import to avoid loading Stripe on every page
      const { startCheckout } = await import('../lib/stripe')
      await startCheckout({ familyId, email: userEmail })
    } catch (err) {
      showToast(`❌ ${err.message}`)
      setCheckoutLoading(false)
    }
  }

  const handleOpenPortal = async () => {
    try {
      const { openBillingPortal } = await import('../lib/stripe')
      await openBillingPortal({ familyId })
    } catch (err) {
      showToast(`❌ ${err.message}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 100%)', fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 24, color: 'white' }}>ChoreQuest 🏆</div>
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
            {isPremium ? '⭐ Premium' : '🔒 Free Plan'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isPremium && (
            <button onClick={() => setTab('upgrade')} style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 12, padding: '7px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: 'white', cursor: 'pointer', boxShadow: '0 2px 12px #f59e0b44' }}>
              ⭐ Upgrade
            </button>
          )}
          <button onClick={onLogout} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 12, padding: '7px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {/* Kid tabs */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 16px 0' }}>
        {data.kids.map(k => {
          const kp = (k.chores||[]).filter(c=>c.pending).length
          const active = activeKidId === k.id
          return (
            <button key={k.id} onClick={() => setActiveKidId(k.id)} style={{ flex: 1, background: active?'#f59e0b':'#1e293b', border: active?'none':'2px solid #334155', borderRadius: 16, padding: '11px 6px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", color: active?'#1e293b':'white', transition: 'all 0.2s', position: 'relative' }}>
              <div style={{ fontSize: 26 }}>{k.avatar}</div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{k.name}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>🔥 {k.streak??0}d</div>
              {kp > 0 && <div style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', borderRadius: 99, width: 20, height: 20, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>{kp}</div>}
            </button>
          )
        })}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', margin: '12px 16px 0', background: '#0f172a', borderRadius: 16, padding: 4, gap: 2 }}>
        {[
          ['home',        '📊'],
          ['approve',     totalPending > 0 ? `✅${totalPending}` : '✅'],
          ['manage',      '✏️'],
          ['summary',     '📋'],
          ['leaderboard', '🏆'],
          ['notifs',      unread > 0 ? `🔔${unread}` : '🔔'],
          isPremium ? ['billing', '⭐'] : ['upgrade', '🔒'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, background: tab === key ? '#f59e0b' : 'transparent', border: 'none', borderRadius: 11, padding: '9px 2px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: tab === key ? '#1e293b' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '14px 16px 80px' }}>

        {/* OVERVIEW */}
        {tab === 'home' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Balance',    value: `$${Number(kid.balance??0).toFixed(2)}`,                                                    icon: '🪙', color: '#f59e0b' },
                { label: 'Streak',     value: `${kid.streak??0} days`,                                                                    icon: '🔥', color: '#f97316' },
                { label: 'Done Today', value: `${(kid.chores||[]).filter(c=>c.done).length}/${(kid.chores||[]).length}`,                  icon: '✅', color: '#22c55e' },
                { label: 'Goal',       value: `${goalTarget>0?Math.round((goalSaved/goalTarget)*100):0}%`,                               icon: '🎯', color: '#818cf8' },
              ].map(s => (
                <div key={s.label} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 18, padding: 15, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>🎯 {goalName}</span><span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13 }}>${goalSaved.toFixed(2)} / ${goalTarget}</span></div>
              <ProgressBar value={goalSaved} max={goalTarget} color="#818cf8" />
              <div style={{ marginTop: 6, fontSize: 11, color: '#475569', fontWeight: 600 }}>${(goalTarget-goalSaved).toFixed(2)} to go</div>
            </div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#475569', marginBottom: 8 }}>All Chores</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(kid.chores||[]).map(c => (
                <div key={c.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 13, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10, opacity: c.done?0.5:1 }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: 'white', fontSize: 13, textDecoration: c.done?'line-through':'none' }}>{c.title}</div><div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>+🪙 ${Number(c.coins).toFixed(2)}</div></div>
                  <span style={{ fontSize: 15 }}>{c.done?'✅':c.pending?'⏳':'○'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* APPROVE */}
        {tab === 'approve' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b', marginBottom: 6 }}>Pending Approvals ⏳</div>
            <div style={{ background: '#0f172a', border: '1.5px solid #1e3a5f', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, lineHeight: 1.5 }}>Approve to update the balance, then use a <span style={{ color: '#38bdf8' }}>pay link</span> to send real money.</div>
            </div>
            {pending.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569', fontWeight: 700, fontSize: 14 }}><div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>All caught up!</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pending.map(chore => {
                    const amt      = Number(chore.coins).toFixed(2)
                    const amtNum   = Number(chore.coins)
                    const noteRaw  = `${kid.name} chores - ${chore.title}`
                    const noteEnc  = encodeURIComponent(noteRaw)

                    // ── Correct mobile deep links ──────────────────────────
                    // Venmo: opens app directly on mobile, falls back to web
                    const venmoUrl    = venmoName
                      ? `venmo://paycharge?txn=pay&amount=${amt}&note=${noteEnc}&recipients=${venmoName}`
                      : `https://venmo.com/`

                    // Cash App: $cashtag link — opens app if installed
                    const cashAppUrl  = cashTag
                      ? `https://cash.app/$${cashTag.replace('$','')}/${amt}`
                      : `https://cash.app/`

                    // PayPal: paypal.me link
                    const paypalUrl   = paypalName
                      ? `https://paypal.me/${paypalName}/${amt}`
                      : `https://paypal.com/`

                    return (
                      <div key={chore.id} style={{ background: '#1e293b', border: '2px solid #fbbf24', borderRadius: 22, padding: 16, boxShadow: '0 4px 24px #f59e0b22' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                          <div style={{ fontSize: 30 }}>{chore.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>{chore.title}</div>
                            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>+🪙 ${amt} for {kid.name}</div>
                          </div>
                        </div>

                        {/* Approve / Reject */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                          <button
                            onClick={async () => {
                              try {
                                await onReject(kid.id, chore.id)
                              } catch(e) { showToast(`❌ ${e.message}`) }
                            }}
                            style={{ background: '#ef444415', border: '2px solid #ef4444', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#ef4444', cursor: 'pointer' }}>
                            ✗ Reject
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await onApprove(kid.id, chore.id)
                              } catch(e) { showToast(`❌ ${e.message}`) }
                            }}
                            style={{ background: '#22c55e', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'white', cursor: 'pointer', boxShadow: '0 4px 16px #22c55e44' }}>
                            ✓ Approve!
                          </button>
                        </div>

                        <div style={{ borderTop: '1.5px solid #334155', marginBottom: 12 }} />
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                          💸 Send real money — ${amt}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                          {/* Venmo */}
                          <a href={venmoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <div style={{ background: '#008cff15', border: '1.5px solid #008cff', borderRadius: 12, padding: '9px 4px', textAlign: 'center', cursor: 'pointer' }}>
                              <div style={{ fontSize: 20, marginBottom: 2 }}>💙</div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#008cff' }}>Venmo</div>
                              <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>${amt}</div>
                            </div>
                          </a>

                          {/* Cash App */}
                          <a href={cashAppUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <div style={{ background: '#00d64f15', border: '1.5px solid #00d64f', borderRadius: 12, padding: '9px 4px', textAlign: 'center', cursor: 'pointer' }}>
                              <div style={{ fontSize: 20, marginBottom: 2 }}>💚</div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#00d64f' }}>Cash App</div>
                              <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>${amt}</div>
                            </div>
                          </a>

                          {/* PayPal */}
                          <a href={paypalUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <div style={{ background: '#009cde15', border: '1.5px solid #009cde', borderRadius: 12, padding: '9px 4px', textAlign: 'center', cursor: 'pointer' }}>
                              <div style={{ fontSize: 20, marginBottom: 2 }}>💛</div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#009cde' }}>PayPal</div>
                              <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>${amt}</div>
                            </div>
                          </a>
                        </div>

                        {(!cashTag || !paypalName) && (
                          <div onClick={() => setTab('manage')} style={{ marginTop: 10, background: '#1e3a5f', border: '1.5px solid #3b82f6', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#93c5fd', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>
                            ⚙️ Tap to set up your Cash App & PayPal usernames →
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
            }
          </>
        )}

        {tab === 'manage' && (
          <div>
            {/* Pay Links Settings */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#f59e0b' }}>💸 Pay Links</div>
                {!editPay && <button onClick={() => setEditPay(true)} style={{ background: '#f59e0b22', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#f59e0b', cursor: 'pointer' }}>✏️ Edit</button>}
              </div>
              {editPay ? (
                <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 18, padding: 16 }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 14 }}>
                    Enter your usernames so pay links open directly in the app on your phone.
                  </div>
                  {[
                    { label: 'Venmo Username', placeholder: 'e.g. john-smith', value: venmoName, onChange: setVenmoName, icon: '💙' },
                    { label: 'Cash App $Cashtag', placeholder: 'e.g. $johnsmith', value: cashTag, onChange: setCashTag, icon: '💚' },
                    { label: 'PayPal.me Username', placeholder: 'e.g. johnsmith', value: paypalName, onChange: setPaypalName, icon: '💛' },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{f.icon}</span>{f.label}
                      </label>
                      <input
                        style={{ width: '100%', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                        value={f.value}
                        onChange={e => f.onChange(e.target.value)}
                        placeholder={f.placeholder}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                      />
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => setEditPay(false)} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={savePayLinks} style={{ background: '#f59e0b', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#1e293b', cursor: 'pointer' }}>Save 💸</button>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 16px' }}>
                  {cashTag || paypalName || venmoName ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {venmoName  && <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>💙 Venmo: <span style={{ color: 'white' }}>{venmoName}</span></div>}
                      {cashTag    && <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>💚 Cash App: <span style={{ color: 'white' }}>${cashTag.replace('$','')}</span></div>}
                      {paypalName && <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>💛 PayPal: <span style={{ color: 'white' }}>paypal.me/{paypalName}</span></div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, textAlign: 'center' }}>
                      No pay links set up yet. Tap Edit to add your usernames.
                    </div>
                  )}
                </div>
              )}
            </div>
            <ManageTab kid={kid} onSaveChore={onSaveChore} onDeleteChore={onDeleteChore} onSaveGoal={onSaveGoal} showToast={showToast} />
          </div>
        )}
        {tab === 'summary'     && <><div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b', marginBottom: 14 }}>Weekly Report 📋</div><WeeklySummary kid={kid} /></>}
        {tab === 'leaderboard' && <><div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b', marginBottom: 14 }}>Leaderboard 🏆</div><Leaderboard kids={data.kids} /></>}

        {/* UPGRADE PAGE */}
        {tab === 'upgrade' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: 'white', marginBottom: 6 }}>Unlock Premium</div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Everything your family needs</div>
            </div>

            {/* Pricing card */}
            <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 22, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white' }}>Premium</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Billed monthly</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 34, color: '#f59e0b' }}>$9.99</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>per month</div>
                </div>
              </div>

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['👨‍👩‍👧', 'Unlimited kids', 'Free plan is limited to 1 kid'],
                  ['💸', 'Pay links', 'Send real money via Venmo, Cash App & PayPal'],
                  ['🛍️', 'Reward Store', 'Kids redeem coins for privileges & treats'],
                  ['📋', 'Weekly Reports', 'Earnings charts & completion history'],
                  ['🏆', 'Leaderboard', 'Fun competition between siblings'],
                  ['🔔', 'Push Notifications', 'Instant alerts on any device'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>{title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free tier comparison */}
            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: '#64748b', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Your current free plan includes</div>
              {[
                '✅ 1 kid',
                '✅ Basic chores & approval flow',
                '✅ Coin balance tracker',
                '✅ Savings goal',
                '❌ Multiple kids',
                '❌ Pay links, Reward Store, Reports',
              ].map(f => (
                <div key={f} style={{ fontSize: 13, color: f.startsWith('✅') ? '#94a3b8' : '#475569', fontWeight: 600, marginBottom: 4 }}>{f}</div>
              ))}
            </div>

            <button
              onClick={handleStartCheckout}
              disabled={checkoutLoading}
              style={{ width: '100%', background: checkoutLoading ? '#334155' : 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 16, padding: 16, fontFamily: "'Fredoka One',cursive", fontSize: 20, color: checkoutLoading ? '#64748b' : 'white', cursor: checkoutLoading ? 'not-allowed' : 'pointer', boxShadow: checkoutLoading ? 'none' : '0 6px 24px #f59e0b55', marginBottom: 12 }}>
              {checkoutLoading ? 'Redirecting to Stripe...' : 'Upgrade to Premium 🚀'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#334155', fontWeight: 600 }}>
              Secured by Stripe · Cancel anytime · No hidden fees
            </div>
          </div>
        )}

        {/* BILLING / MANAGE SUBSCRIPTION (premium users) */}
        {tab === 'billing' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>⭐</div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 4 }}>You're on Premium!</div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>All features are unlocked for your family</div>
            </div>

            <div style={{ background: '#1e293b', border: '2px solid #22c55e', borderRadius: 20, padding: 18, marginBottom: 16 }}>
              {[
                ['👨‍👩‍👧', 'Unlimited kids', true],
                ['💸', 'Pay links', true],
                ['🛍️', 'Reward Store', true],
                ['📋', 'Weekly Reports', true],
                ['🏆', 'Leaderboard', true],
                ['🔔', 'Push Notifications', true],
              ].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: 14, flex: 1 }}>{label}</span>
                  <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>
                </div>
              ))}
            </div>

            <button onClick={handleOpenPortal} style={{ width: '100%', background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: 15, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, color: '#94a3b8', cursor: 'pointer', marginBottom: 10 }}>
              Manage Subscription →
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#334155', fontWeight: 600 }}>
              Update payment method · Cancel · Download invoices
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab === 'notifs' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b' }}>Notifications 🔔</div>
              {unread > 0 && <button onClick={() => onMarkRead()} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: '#64748b', cursor: 'pointer' }}>Mark all read</button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data.notifications||[]).map(n => (
                <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ background: n.read?'#1e293b':'#1e3a5f', border: n.read?'1.5px solid #334155':'1.5px solid #3b82f6', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20 }}>{n.type==='pending'?'⏳':n.type==='streak'?'🔥':'🎯'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: 13, lineHeight: 1.4 }}>{n.message ?? n.msg}</div>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginTop: 3 }}>{n.created_at ? new Date(n.created_at).toLocaleString() : n.time}</div>
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 4, flexShrink: 0 }} />}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
