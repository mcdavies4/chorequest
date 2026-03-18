import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function getCachedKids(familyId) {
  try { return JSON.parse(sessionStorage.getItem(`cq_kids_${familyId}`)) || [] } catch { return [] }
}
function setCachedKids(familyId, data) {
  try { sessionStorage.setItem(`cq_kids_${familyId}`, JSON.stringify(data)) } catch {}
}

export function useFamily(familyId) {
  const cached = familyId ? getCachedKids(familyId) : []
  const [kids,          setKids]          = useState(cached)
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(cached.length === 0) // no spinner if cached
  const [error,         setError]         = useState(null)

  const loadAll = useCallback(async () => {
    if (!familyId) return
    // Only show spinner if we have nothing to show yet
    if (kids.length === 0) setLoading(true)
    try {
      const [kidsRes, notifsRes] = await Promise.all([
        supabase
          .from('kids')
          .select(`*, chores(*), redeemed_rewards(*), weekly_history(*)`)
          .eq('family_id', familyId)
          .order('created_at', { ascending: true }),
        supabase
          .from('notifications')
          .select('*')
          .eq('family_id', familyId)
          .order('created_at', { ascending: false })
          .limit(50),
      ])
      if (kidsRes.error)   throw kidsRes.error
      if (notifsRes.error) throw notifsRes.error
      setKids(kidsRes.data || [])
      setNotifications(notifsRes.data || [])
      setCachedKids(familyId, kidsRes.data || [])
    } catch (err) {
      console.error('loadAll error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (!familyId) return
    const ch1 = supabase.channel('chores_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores', filter: `family_id=eq.${familyId}` }, () => loadAll())
      .subscribe()
    const ch2 = supabase.channel('notifs_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `family_id=eq.${familyId}` }, (payload) => setNotifications(prev => [payload.new, ...prev]))
      .subscribe()
    const ch3 = supabase.channel('kids_rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kids', filter: `family_id=eq.${familyId}` }, () => loadAll())
      .subscribe()
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); supabase.removeChannel(ch3) }
  }, [familyId, loadAll])

  const markChorePending = useCallback(async (choreId, kidId, kidName, choreTitle, explicitFamilyId) => {
    const fid = explicitFamilyId || familyId
    if (!fid) throw new Error('No family ID — please log in again')
    const { error } = await supabase.from('chores').update({ pending: true }).eq('id', choreId)
    if (error) throw error
    await supabase.from('notifications').insert({ family_id: fid, kid_id: kidId, type: 'pending', message: `${kidName} completed '${choreTitle}' — needs approval` })
  }, [familyId])

  const approveChore = useCallback(async (choreId, kidId, coins) => {
    // Step 1: mark chore as done
    const { error: choreErr } = await supabase
      .from('chores')
      .update({ done: true, pending: false })
      .eq('id', choreId)
    if (choreErr) throw choreErr

    // Step 2: fetch fresh kid data directly from DB (avoids stale closure)
    const { data: freshKid, error: fetchErr } = await supabase
      .from('kids')
      .select('id, balance, goal_saved')
      .eq('id', kidId)
      .single()
    if (fetchErr) throw fetchErr
    if (!freshKid) throw new Error('Kid not found')

    // Step 3: update balance and goal_saved
    const newBalance   = +(Number(freshKid.balance)    + Number(coins)).toFixed(2)
    const newGoalSaved = +(Number(freshKid.goal_saved) + Number(coins)).toFixed(2)

    const { error: kidErr } = await supabase
      .from('kids')
      .update({ balance: newBalance, goal_saved: newGoalSaved })
      .eq('id', kidId)
    if (kidErr) throw kidErr
  }, [])

  const rejectChore = useCallback(async (choreId) => {
    const { error } = await supabase.from('chores').update({ pending: false }).eq('id', choreId)
    if (error) throw error
  }, [])

  const addChore = useCallback(async (kidId, chore) => {
    const { error } = await supabase.from('chores').insert({ kid_id: kidId, family_id: familyId, title: chore.title, icon: chore.icon, coins: chore.coins })
    if (error) throw error
  }, [familyId])

  const updateChore = useCallback(async (choreId, updates) => {
    const { error } = await supabase.from('chores').update(updates).eq('id', choreId)
    if (error) throw error
  }, [])

  const deleteChore = useCallback(async (choreId) => {
    const { error } = await supabase.from('chores').delete().eq('id', choreId)
    if (error) throw error
  }, [])

  const updateGoal = useCallback(async (kidId, goalName, goalTarget) => {
    const { error } = await supabase.from('kids').update({ goal_name: goalName, goal_target: goalTarget }).eq('id', kidId)
    if (error) throw error
  }, [])

  const redeemReward = useCallback(async (kidId, reward) => {
    const kid = kids.find(k => k.id === kidId)
    if (!kid || Number(kid.balance) < reward.cost) throw new Error('Insufficient balance')
    await Promise.all([
      supabase.from('kids').update({ balance: +(Number(kid.balance) - reward.cost).toFixed(2) }).eq('id', kidId),
      supabase.from('redeemed_rewards').insert({ kid_id: kidId, family_id: familyId, title: reward.title, icon: reward.icon, cost: reward.cost }),
      supabase.from('notifications').insert({ family_id: familyId, kid_id: kidId, type: 'reward', message: `${kid.name} redeemed "${reward.title}" from the store!` }),
    ])
  }, [kids, familyId])

  const markNotificationRead = useCallback(async (notifId) => {
    if (notifId) {
      await supabase.from('notifications').update({ read: true }).eq('id', notifId)
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n))
    } else {
      await supabase.from('notifications').update({ read: true }).eq('family_id', familyId)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }, [familyId])

  return {
    kids, notifications, loading, error, reload: loadAll,
    markChorePending, approveChore, rejectChore,
    addChore, updateChore, deleteChore, updateGoal,
    redeemReward, markNotificationRead,
  }
}
