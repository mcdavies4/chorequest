// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component — now includes subscription state.
// Passes plan/isPremium down to all views for feature gating.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useAuth }            from './hooks/useAuth'
import { useFamily }          from './hooks/useFamily'
import { useSubscription }    from './hooks/useSubscription'
import { saveOnboarding }     from './lib/onboarding'
import { GLOBAL_STYLES, CoinBurst, Toast } from './components/shared'
import { OnboardingFlow }     from './components/OnboardingFlow'
import { LoginScreen }        from './components/LoginScreen'
import { KidLogin }           from './components/KidLogin'
import { KidView }            from './components/KidView'
import { ParentView }         from './components/ParentView'
import { SubscriptionBanner } from './components/SubscriptionBanner'

export default function App() {
  const { user, family, loading: authLoading, signUp, signIn, signOut } = useAuth()

  const { kids, notifications, loading: dataLoading, reload,
          markChorePending, approveChore, rejectChore,
          addChore, updateChore, deleteChore, updateGoal,
          redeemReward, markNotificationRead } = useFamily(family?.id)

  const { subscription, plan, isPremium, checkoutMsg,
          clearCheckoutMsg, canAccess } = useSubscription(family?.id)

  const [screen,      setScreen]      = useState('onboarding')
  const [activeKidId, setActiveKidId] = useState(null)
  const [kidUser,     setKidUser]     = useState(null)
  const [burst,       setBurst]       = useState(null)
  const [toast,       setToast]       = useState(null)

  const showToast = msg => setToast(msg)

  // Show checkout success/cancel toast
  useEffect(() => {
    if (!checkoutMsg) return
    if (checkoutMsg === 'success') showToast('🎉 Welcome to Premium! All features unlocked.')
    if (checkoutMsg === 'cancel')  showToast('Checkout cancelled — you can upgrade anytime.')
    clearCheckoutMsg()
  }, [checkoutMsg])

  // Redirect once auth resolves
  useEffect(() => {
    if (authLoading) return
    if (user && family) {
      setScreen('app')
      if (kids.length > 0 && !activeKidId) setActiveKidId(kids[0].id)
    }
  }, [user, family, authLoading, kids])

  const handleOnboardingComplete = async (result) => {
    if (!result) { setScreen('login'); return }
    try {
      const { family: newFamily } = await signUp({
        email: result.email, password: result.password, parentName: result.parentName,
      })
      await saveOnboarding({ familyId: newFamily.id, kids: result.kids, selectedChores: result.selectedChores, goals: result.goals })
      await reload()
      setScreen('app')
      showToast(`🎉 Welcome to ChoreQuest, ${result.parentName}!`)
    } catch (err) {
      showToast(`❌ ${err.message}`)
    }
  }

  const handleParentLogin = async ({ email, password }) => {
    await signIn({ email, password })
  }

  const handleKidLogin = (kid) => {
    setKidUser(kid); setActiveKidId(kid.id); setScreen('app-kid')
  }

  const handleSignOut = async () => {
    await signOut(); setKidUser(null); setActiveKidId(null); setScreen('login')
  }

  const handleMarkDone = async (kidId, choreId, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    try {
      const kid   = kids.find(k => k.id === kidId)
      const chore = kid?.chores?.find(c => c.id === choreId)
      await markChorePending(choreId, kidId, kid?.name, chore?.title)
    } catch (err) { showToast(`❌ ${err.message}`) }
  }

  const handleApprove = async (kidId, choreId) => {
    try {
      const kid   = kids.find(k => k.id === kidId)
      const chore = kid?.chores?.find(c => c.id === choreId)
      await approveChore(choreId, kidId, Number(chore?.coins || 0))
      showToast('✅ Approved! Coins added.')
    } catch (err) { showToast(`❌ ${err.message}`) }
  }

  const handleReject = async (kidId, choreId) => {
    try { await rejectChore(choreId); showToast('✗ Chore sent back.') }
    catch (err) { showToast(`❌ ${err.message}`) }
  }

  const handleRedeemReward = async (kidId, reward) => {
    // Gate: reward store is premium only
    if (!canAccess('reward_store')) {
      showToast('🔒 Upgrade to Premium to use the Reward Store')
      return
    }
    try { await redeemReward(kidId, reward); showToast(`🎉 "${reward.title}" redeemed!`) }
    catch (err) { showToast(`❌ ${err.message}`) }
  }

  const handleSaveChore = async (kidId, chore) => {
    try {
      if (chore.id && typeof chore.id === 'string' && chore.id.length > 10) {
        await updateChore(chore.id, { title: chore.title, icon: chore.icon, coins: chore.coins })
      } else {
        await addChore(kidId, chore)
      }
    } catch (err) { showToast(`❌ ${err.message}`) }
  }

  const handleDeleteChore = async (kidId, choreId) => {
    try { await deleteChore(choreId); showToast('🗑️ Chore removed.') }
    catch (err) { showToast(`❌ ${err.message}`) }
  }

  const handleSaveGoal = async (kidId, goal) => {
    try { await updateGoal(kidId, goal.name, goal.target); showToast('🎯 Goal updated!') }
    catch (err) { showToast(`❌ ${err.message}`) }
  }

  // Gate: adding more than 1 kid is premium only
  const handleAddKid = () => {
    if (!canAccess('multiple_kids') && kids.length >= 1) {
      showToast('🔒 Upgrade to Premium to add more kids')
      return false
    }
    return true
  }

  const activeKid = kids.find(k => k.id === activeKidId) || kids[0]

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ fontSize: 52 }}>🏆</div>
        <div style={{ fontFamily: 'sans-serif', color: '#475569', fontWeight: 700 }}>Loading ChoreQuest...</div>
      </div>
    )
  }

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      {burst && <CoinBurst x={burst.x} y={burst.y} onDone={() => setBurst(null)} />}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div className="fade-in" style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh' }}>
        {screen === 'onboarding' && <OnboardingFlow onComplete={handleOnboardingComplete} />}

        {screen === 'login' && (
          <LoginScreen
            onParentLogin={handleParentLogin}
            onKidLogin={() => setScreen('kid-login')}
            onNewFamily={() => setScreen('onboarding')}
          />
        )}

        {screen === 'kid-login' && (
          <KidLogin kids={kids} onLogin={handleKidLogin} onBack={() => setScreen('login')} />
        )}

        {screen === 'app-kid' && kidUser && (
          <KidView
            kid={kids.find(k => k.id === kidUser.id) || kidUser}
            plan={plan}
            onMarkDone={handleMarkDone}
            onLogout={handleSignOut}
            onRedeemReward={handleRedeemReward}
          />
        )}

        {screen === 'app' && user && (
          <>
            {/* Subscription status banners */}
            <SubscriptionBanner
              subscription={subscription}
              familyId={family?.id}
              checkoutMsg={checkoutMsg}
              onDismiss={clearCheckoutMsg}
            />
            <ParentView
              data={{ kids, notifications }}
              plan={plan}
              isPremium={isPremium}
              familyId={family?.id}
              userEmail={user?.email}
              canAccess={canAccess}
              onApprove={handleApprove}
              onReject={handleReject}
              onLogout={handleSignOut}
              onMarkRead={markNotificationRead}
              onSaveChore={handleSaveChore}
              onDeleteChore={handleDeleteChore}
              onSaveGoal={handleSaveGoal}
              showToast={showToast}
              activeKidId={activeKidId || kids[0]?.id}
              setActiveKidId={setActiveKidId}
            />
          </>
        )}
      </div>
    </>
  )
}
