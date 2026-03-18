// src/hooks/useSubscription.js
// ─────────────────────────────────────────────────────────────
// Loads and exposes the family's subscription state.
// Checks URL params on mount to show success/cancel toasts
// after returning from Stripe Checkout.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { canAccess } from '../lib/stripe'

export function useSubscription(familyId) {
  const [subscription, setSubscription] = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [checkoutMsg,  setCheckoutMsg]  = useState(null) // success | cancel

  // Load subscription from DB
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
      console.error('useSubscription error:', err)
      setSubscription({ plan: 'free', status: 'active' })
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => { loadSubscription() }, [loadSubscription])

  // Listen for realtime subscription updates
  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel('subscription_rt')
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'subscriptions',
        filter: `family_id=eq.${familyId}`,
      }, (payload) => {
        setSubscription(payload.new)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [familyId])

  // Check for ?checkout=success or ?checkout=cancel in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('checkout')
    if (status === 'success') {
      setCheckoutMsg('success')
      // Reload subscription — webhook may take a second
      setTimeout(loadSubscription, 2000)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (status === 'cancel') {
      setCheckoutMsg('cancel')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const plan   = subscription?.plan   ?? 'free'
  const status = subscription?.status ?? 'active'
  const isPremium    = plan === 'premium' && status === 'active'
  const isCanceled   = status === 'canceled'
  const isPaymentDue = status === 'past_due'

  return {
    subscription,
    plan,
    status,
    isPremium,
    isCanceled,
    isPaymentDue,
    loading,
    checkoutMsg,
    clearCheckoutMsg: () => setCheckoutMsg(null),
    reload: loadSubscription,
    canAccess: (feature) => canAccess(plan, feature),
  }
}
