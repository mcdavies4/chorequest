// src/hooks/useSubscription.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSubscription(familyId) {
  const [subscription, setSubscription] = useState(null)
  const [loading,      setLoading]      = useState(true)

  const loadSubscription = useCallback(async () => {
    if (!familyId) { setLoading(false); return }
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('family_id', familyId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      setSubscription(data ?? { plan: 'free', status: 'active' })
    } catch (err) {
      // Table may not exist yet — default to free silently
      setSubscription({ plan: 'free', status: 'active' })
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => { loadSubscription() }, [loadSubscription])

  // Realtime sync
  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel('subscription_rt')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'subscriptions',
        filter: `family_id=eq.${familyId}`,
      }, (payload) => setSubscription(payload.new))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [familyId])

  // Check URL for ?checkout=success after returning from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      setTimeout(loadSubscription, 2000)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('checkout') === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const plan      = subscription?.plan   ?? 'free'
  const status    = subscription?.status ?? 'active'
  const isPremium = plan === 'premium' && status === 'active'

  return { subscription, plan, status, isPremium, loading, reload: loadSubscription }
}
