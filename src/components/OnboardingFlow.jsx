import { useState } from 'react'
import { KID_AVATARS, SUGGESTED_CHORES } from './shared'

export function OnboardingFlow({ onComplete }) {
  const [step, setStep]                   = useState(0)
  const [parentName, setParentName]       = useState('')
  const [parentEmail, setParentEmail]     = useState('')
  const [parentPw, setParentPw]           = useState('')
  const [kids, setKids]                   = useState([{ id: 1, name: '', age: '', avatar: '🦊', pw: '' }])
  const [activeKidIdx, setActiveKidIdx]   = useState(0)
  const [selectedChores, setSelectedChores] = useState({})
  const [goals, setGoals]                 = useState({})
  const [errors, setErrors]               = useState({})

  const pct = Math.round((step / 5) * 100)
  const inp = (err) => ({ width: '100%', background: '#0f172a', border: `1.5px solid ${err ? '#ef4444' : '#334155'}`, borderRadius: 14, padding: '13px 16px', color: 'white', fontSize: 15, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' })
  const lbl = { fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }

  const validate = () => {
    const e = {}
    if (step === 1) {
      if (!parentName.trim()) e.parentName = 'Enter your name'
      if (!parentEmail.includes('@')) e.parentEmail = 'Enter a valid email'
      if (parentPw.length < 6) e.parentPw = 'At least 6 characters'
    }
    if (step === 2) {
      kids.forEach((k, i) => {
        if (!k.name.trim()) e[`kid${i}name`] = 'Enter a name'
        if (!k.age || isNaN(k.age) || +k.age < 3 || +k.age > 17) e[`kid${i}age`] = 'Age 3–17'
        if (k.pw.length < 3) e[`kid${i}pw`] = 'At least 3 characters'
      })
    }
    if (step === 3) kids.forEach(k => { if (!(selectedChores[k.id]?.length >= 1)) e[`chores${k.id}`] = 'Pick at least 1 chore' })
    if (step === 4) kids.forEach(k => {
      if (!goals[k.id]?.name?.trim()) e[`goalname${k.id}`] = 'Enter a goal name'
      if (isNaN(parseFloat(goals[k.id]?.target)) || parseFloat(goals[k.id]?.target) < 1) e[`goaltarget${k.id}`] = 'Enter a valid amount'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(s => s + 1) }
  const back = () => { setStep(s => s - 1); setErrors({}) }

  const toggleChore = (kidId, chore) => {
    setSelectedChores(prev => {
      const cur = prev[kidId] || []
      const exists = cur.find(c => c.title === chore.title)
      return { ...prev, [kidId]: exists ? cur.filter(c => c.title !== chore.title) : [...cur, { ...chore, id: Date.now() + Math.random(), done: false, pending: false }] }
    })
  }

  const handleFinish = () => {
    onComplete({ parentName, email: parentEmail, password: parentPw, kids, selectedChores, goals })
  }

  const activeKid = kids[activeKidIdx]

  const StepWelcome = () => (
    <div style={{ textAlign: 'center', padding: '0 8px' }}>
      <div style={{ fontSize: 72, marginBottom: 12, animation: 'bounce 1s ease infinite' }}>🏆</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 34, color: 'white', marginBottom: 8 }}>Welcome to ChoreQuest!</div>
      <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, lineHeight: 1.6, marginBottom: 32 }}>The fun way to manage chores,<br />reward effort, and teach kids<br />the value of money. 🌟</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {[['⚡','Assign chores & track completion'],['🪙','Reward with coins & real pay links'],['🎯','Set savings goals kids care about'],['🏆','Leaderboards, streaks & badges']].map(([ic, txt]) => (
          <div key={txt} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
            <span style={{ fontSize: 22 }}>{ic}</span><span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14 }}>{txt}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setStep(1)} style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 16, padding: 16, fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white', cursor: 'pointer', boxShadow: '0 6px 24px #f59e0b55' }}>Set Up My Family 🚀</button>
      <button onClick={() => onComplete(null)} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#475569', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>I already have an account →</button>
    </div>
  )

  const StepParent = () => (
    <div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 6 }}>About You 👋</div>
      <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>Set up your parent account.</div>
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Your First Name</label>
        <input style={inp(errors.parentName)} value={parentName} onChange={e => { setParentName(e.target.value); setErrors(er => ({ ...er, parentName: null })) }} placeholder="e.g. Sarah" />
        {errors.parentName && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors.parentName}</div>}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Email Address</label>
        <input type="email" style={inp(errors.parentEmail)} value={parentEmail} onChange={e => { setParentEmail(e.target.value); setErrors(er => ({ ...er, parentEmail: null })) }} placeholder="you@example.com" />
        {errors.parentEmail && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors.parentEmail}</div>}
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={lbl}>Password</label>
        <input type="password" style={inp(errors.parentPw)} value={parentPw} onChange={e => { setParentPw(e.target.value); setErrors(er => ({ ...er, parentPw: null })) }} placeholder="Min. 6 characters" />
        {errors.parentPw && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors.parentPw}</div>}
      </div>
      <div style={{ background: '#0f172a', border: '1.5px solid #1e3a5f', borderRadius: 12, padding: '10px 14px', marginTop: 14 }}>
        <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>💡 This email and password is for the parent dashboard. Kids get their own PINs.</div>
      </div>
    </div>
  )

  const StepKids = () => (
    <div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 6 }}>Add Your Kids 👧👦</div>
      <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Each kid gets their own login.</div>
      {kids.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {kids.map((k, i) => <button key={k.id} onClick={() => setActiveKidIdx(i)} style={{ flex: 1, background: activeKidIdx === i ? '#f59e0b' : '#1e293b', border: activeKidIdx === i ? 'none' : '1.5px solid #334155', borderRadius: 12, padding: '8px 4px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: activeKidIdx === i ? '#1e293b' : '#64748b', cursor: 'pointer' }}>{k.avatar} {k.name || `Kid ${i + 1}`}</button>)}
        </div>
      )}
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 18, marginBottom: 14 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Pick an Avatar</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {KID_AVATARS.slice(0, 12).map(av => <button key={av} onClick={() => setKids(prev => prev.map((k, i) => i === activeKidIdx ? { ...k, avatar: av } : k))} style={{ fontSize: 28, background: activeKid.avatar === av ? '#f59e0b22' : 'transparent', border: activeKid.avatar === av ? '2px solid #f59e0b' : '2px solid transparent', borderRadius: 12, padding: '4px 6px', cursor: 'pointer' }}>{av}</button>)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Name</label>
            <input style={{ ...inp(errors[`kid${activeKidIdx}name`]), padding: '11px 12px' }} value={activeKid.name} onChange={e => { setKids(prev => prev.map((k, i) => i === activeKidIdx ? { ...k, name: e.target.value } : k)); setErrors(er => ({ ...er, [`kid${activeKidIdx}name`]: null })) }} placeholder="First name" />
            {errors[`kid${activeKidIdx}name`] && <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginTop: 3 }}>{errors[`kid${activeKidIdx}name`]}</div>}
          </div>
          <div>
            <label style={lbl}>Age</label>
            <input type="number" style={{ ...inp(errors[`kid${activeKidIdx}age`]), padding: '11px 12px' }} value={activeKid.age} onChange={e => { setKids(prev => prev.map((k, i) => i === activeKidIdx ? { ...k, age: e.target.value } : k)); setErrors(er => ({ ...er, [`kid${activeKidIdx}age`]: null })) }} placeholder="e.g. 9" min="3" max="17" />
            {errors[`kid${activeKidIdx}age`] && <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginTop: 3 }}>{errors[`kid${activeKidIdx}age`]}</div>}
          </div>
        </div>
        <div>
          <label style={lbl}>Kid's PIN</label>
          <input type="password" style={inp(errors[`kid${activeKidIdx}pw`])} value={activeKid.pw} onChange={e => { setKids(prev => prev.map((k, i) => i === activeKidIdx ? { ...k, pw: e.target.value } : k)); setErrors(er => ({ ...er, [`kid${activeKidIdx}pw`]: null })) }} placeholder="Min. 3 characters" />
          {errors[`kid${activeKidIdx}pw`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors[`kid${activeKidIdx}pw`]}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {kids.length < 4 && <button onClick={() => { const id = Date.now(); setKids(prev => [...prev, { id, name: '', age: '', avatar: '🐼', pw: '' }]); setActiveKidIdx(kids.length) }} style={{ flex: 1, background: '#22c55e15', border: '1.5px solid #22c55e', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#22c55e', cursor: 'pointer' }}>+ Add Another Kid</button>}
        {kids.length > 1 && <button onClick={() => { setKids(prev => prev.filter((_, i) => i !== activeKidIdx)); setActiveKidIdx(Math.max(0, activeKidIdx - 1)) }} style={{ background: '#ef444415', border: '1.5px solid #ef4444', borderRadius: 12, padding: '10px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#ef4444', cursor: 'pointer' }}>Remove</button>}
      </div>
    </div>
  )

  const StepChores = () => (
    <div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 6 }}>Pick Chores ⚡</div>
      <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Choose from suggestions. Add more later.</div>
      {kids.length > 1 && <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>{kids.map((k, i) => <button key={k.id} onClick={() => setActiveKidIdx(i)} style={{ flex: 1, background: activeKidIdx === i ? '#f59e0b' : '#1e293b', border: activeKidIdx === i ? 'none' : '1.5px solid #334155', borderRadius: 12, padding: '7px 4px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: activeKidIdx === i ? '#1e293b' : '#64748b', cursor: 'pointer' }}>{k.avatar} {k.name}</button>)}</div>}
      <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13, marginBottom: 10 }}>{activeKid.avatar} {activeKid.name}'s chores — {(selectedChores[activeKid.id] || []).length} selected</div>
      {errors[`chores${activeKid.id}`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{errors[`chores${activeKid.id}`]}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SUGGESTED_CHORES.map(chore => {
          const sel = (selectedChores[activeKid.id] || []).find(c => c.title === chore.title)
          return (
            <div key={chore.title} onClick={() => { toggleChore(activeKid.id, chore); setErrors(er => ({ ...er, [`chores${activeKid.id}`]: null })) }} style={{ background: sel ? '#f59e0b15' : '#1e293b', border: sel ? '2px solid #f59e0b' : '1.5px solid #334155', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.18s' }}>
              <span style={{ fontSize: 24 }}>{chore.icon}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>{chore.title}</div><div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>🪙 ${chore.coins.toFixed(2)}</div></div>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: sel ? '#f59e0b' : 'transparent', border: sel ? 'none' : '2px solid #334155', display: 'grid', placeItems: 'center', fontSize: 14, color: '#1e293b', flexShrink: 0 }}>{sel ? '✓' : ''}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const StepGoals = () => (
    <div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 6 }}>Set Savings Goals 🎯</div>
      <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>What is each kid saving up for?</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {kids.map(k => (
          <div key={k.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}><span style={{ fontSize: 30 }}>{k.avatar}</span><div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white' }}>{k.name}'s Goal</div></div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Saving for...</label>
              <input style={inp(errors[`goalname${k.id}`])} value={goals[k.id]?.name || ''} onChange={e => { setGoals(g => ({ ...g, [k.id]: { ...g[k.id], name: e.target.value } })); setErrors(er => ({ ...er, [`goalname${k.id}`]: null })) }} placeholder="e.g. LEGO Set, Nintendo Switch..." />
              {errors[`goalname${k.id}`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors[`goalname${k.id}`]}</div>}
            </div>
            <div>
              <label style={lbl}>Target Amount ($)</label>
              <input type="number" min="1" step="1" style={inp(errors[`goaltarget${k.id}`])} value={goals[k.id]?.target || ''} onChange={e => { setGoals(g => ({ ...g, [k.id]: { ...g[k.id], target: e.target.value } })); setErrors(er => ({ ...er, [`goaltarget${k.id}`]: null })) }} placeholder="e.g. 25" />
              {errors[`goaltarget${k.id}`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors[`goaltarget${k.id}`]}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const StepDone = () => (
    <div style={{ textAlign: 'center', padding: '20px 8px' }}>
      <div style={{ fontSize: 80, marginBottom: 12 }}>🎉</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 30, color: 'white', marginBottom: 8 }}>You're all set, {parentName}!</div>
      <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, lineHeight: 1.7, marginBottom: 28 }}>Here's your family summary:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
        {kids.map(k => (
          <div key={k.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 32 }}>{k.avatar}</span>
              <div><div style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>{k.name}, age {k.age}</div><div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>🎯 {goals[k.id]?.name} (${goals[k.id]?.target})</div></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(selectedChores[k.id] || []).map(c => <div key={c.title} style={{ background: '#0f172a', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{c.icon} {c.title}</div>)}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleFinish} style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 16, padding: 16, fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white', cursor: 'pointer', boxShadow: '0 6px 24px #f59e0b55' }}>Let's Start Questing! 🚀</button>
    </div>
  )

  const steps = [StepWelcome, StepParent, StepKids, StepChores, StepGoals, StepDone]
  const StepComponent = steps[step]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 100%)', fontFamily: "'Nunito',sans-serif", padding: '24px 20px 40px' }}>
      {step > 0 && step < 5 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Step {step} of 4</div>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>{pct}% complete</div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s cubic-bezier(.34,1.56,.64,1)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {['You','Kids','Chores','Goals'].map((label, i) => <div key={label} style={{ fontSize: 10, fontWeight: 800, color: step > i ? '#f59e0b' : '#334155' }}>{step > i ? '✓ ' : ''}{label}</div>)}
          </div>
        </div>
      )}
      <div style={{ animation: 'fadeIn 0.3s ease' }}><StepComponent /></div>
      {step > 0 && step < 5 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={back} style={{ flex: 1, background: 'transparent', border: '1.5px solid #334155', borderRadius: 14, padding: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, color: '#64748b', cursor: 'pointer' }}>← Back</button>
          <button onClick={next} style={{ flex: 2, background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 14, padding: 13, fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white', cursor: 'pointer', boxShadow: '0 4px 16px #f59e0b44' }}>{step === 4 ? 'Review →' : 'Continue →'}</button>
        </div>
      )}
    </div>
  )
}
