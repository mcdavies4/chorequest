import { useState } from 'react'
import { REWARDS, ProgressBar } from './shared'

export function KidView({ kid, onMarkDone, onLogout, onRedeemReward }) {
  const [tab, setTab] = useState('chores')

  const chores       = kid.chores || []
  const pendingCount = chores.filter(c => c.pending).length
  const doneCount    = chores.filter(c => c.done).length
  const categories   = [...new Set(REWARDS.map(r => r.category))]
  const balance      = Number(kid.balance ?? 0)
  const streak       = kid.streak ?? 0
  const goalName     = kid.goal_name  ?? kid.savedGoal?.name   ?? 'My Goal'
  const goalTarget   = Number(kid.goal_target ?? kid.savedGoal?.target ?? 10)
  const goalSaved    = Number(kid.goal_saved  ?? kid.savedGoal?.saved  ?? 0)
  const redeemed     = kid.redeemed_rewards ?? kid.redeemedRewards ?? []

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#fef3c7 0%,#fde68a 50%,#fed7aa 100%)', fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#92400e' }}>ChoreQuest 🏆</div>
        <button onClick={onLogout} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '7px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: '#92400e', cursor: 'pointer', boxShadow: '0 2px 8px #00000022' }}>Sign Out</button>
      </div>

      {/* Kid card */}
      <div style={{ margin: '14px 16px 0', background: 'white', borderRadius: 26, padding: '18px 18px 14px', boxShadow: '0 8px 32px #f59e0b33', textAlign: 'center' }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 4 }}>{kid.avatar}</div>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#1e293b' }}>{kid.name}</div>
        <div style={{ fontSize: 36, fontFamily: "'Fredoka One',cursive", color: '#f59e0b', margin: '4px 0 2px' }}>🪙 ${balance.toFixed(2)}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>balance · 🔥 {streak} day streak</div>
        <div style={{ background: '#fffbeb', borderRadius: 14, padding: '10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 12, color: '#92400e' }}>🎯 {goalName}</span>
            <span style={{ fontWeight: 800, fontSize: 12, color: '#f59e0b' }}>${goalSaved.toFixed(2)} / ${goalTarget}</span>
          </div>
          <ProgressBar value={goalSaved} max={goalTarget} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '12px 16px 0', background: 'white', borderRadius: 16, padding: 4, boxShadow: '0 2px 12px #00000011' }}>
        {[['chores','⚡ Quests'],['store','🛍️ Store'],['history','📋 History']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, background: tab === key ? '#f59e0b' : 'transparent', border: 'none', borderRadius: 12, padding: '9px 4px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: tab === key ? '#1e293b' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '14px 16px 80px' }}>
        {/* CHORES */}
        {tab === 'chores' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#92400e' }}>Today's Quests</div>
              <div style={{ background: '#92400e', color: 'white', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{doneCount}/{chores.length} done</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chores.map(chore => {
                const bg     = chore.done ? '#f0fdf4' : chore.pending ? '#fffbeb' : 'white'
                const border = chore.done ? '2px solid #bbf7d0' : chore.pending ? '2px solid #fde68a' : '2px solid #f1f5f9'
                return (
                  <div key={chore.id} onClick={e => !chore.done && !chore.pending && onMarkDone(kid.id, chore.id, e)}
                    style={{ background: bg, border, borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: chore.done || chore.pending ? 'default' : 'pointer', boxShadow: '0 2px 10px #00000010', transition: 'transform 0.15s', opacity: chore.done ? 0.7 : 1 }}
                    onMouseEnter={e => { if (!chore.done && !chore.pending) e.currentTarget.style.transform = 'scale(1.02)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                    <div style={{ fontSize: 28 }}>{chore.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', textDecoration: chore.done ? 'line-through' : 'none' }}>{chore.title}</div>
                      <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>+🪙 ${Number(chore.coins).toFixed(2)}</div>
                    </div>
                    <div style={{ fontSize: 20 }}>{chore.done ? '✅' : chore.pending ? '⏳' : <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px dashed #cbd5e1', display: 'grid', placeItems: 'center', color: '#cbd5e1', fontSize: 16 }}>+</div>}</div>
                  </div>
                )
              })}
            </div>
            {pendingCount > 0 && <div style={{ marginTop: 14, background: '#fef9c3', border: '2px dashed #fbbf24', borderRadius: 14, padding: 14, textAlign: 'center', fontWeight: 800, color: '#92400e', fontSize: 13 }}>⏳ {pendingCount} chore{pendingCount > 1 ? 's' : ''} waiting for parent approval!</div>}
          </>
        )}

        {/* STORE */}
        {tab === 'store' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#92400e', marginBottom: 14 }}>Reward Store 🛍️</div>
            {categories.map(cat => (
              <div key={cat} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {REWARDS.filter(r => r.category === cat).map(reward => {
                    const can = balance >= reward.cost
                    return (
                      <div key={reward.id} style={{ background: 'white', border: `2px solid ${can ? '#fde68a' : '#f1f5f9'}`, borderRadius: 18, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 2px 10px #00000010', opacity: can ? 1 : 0.5 }}>
                        <div style={{ fontSize: 28 }}>{reward.icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>{reward.title}</div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{reward.subtitle}</div></div>
                        <button onClick={() => can && onRedeemReward(kid.id, reward)} disabled={!can} style={{ background: can ? '#f59e0b' : '#e2e8f0', border: 'none', borderRadius: 11, padding: '7px 11px', fontFamily: "'Fredoka One',cursive", fontSize: 13, color: can ? '#1e293b' : '#94a3b8', cursor: can ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
                          🪙 ${reward.cost.toFixed(2)}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#92400e', marginBottom: 14 }}>Your History 📋</div>
            {redeemed.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontWeight: 700, fontSize: 14 }}><div style={{ fontSize: 48, marginBottom: 10 }}>🛒</div>No rewards redeemed yet.<br />Check out the store!</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...redeemed].reverse().map((r, i) => (
                    <div key={i} style={{ background: 'white', border: '2px solid #bbf7d0', borderRadius: 16, padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ fontSize: 24 }}>{r.icon}</div>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>{r.title}</div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString() : r.redeemedAt}</div></div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#ef4444' }}>-🪙 ${Number(r.cost).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
            }
          </>
        )}
      </div>
    </div>
  )
}
