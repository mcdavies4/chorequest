import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Cache family in sessionStorage so refresh feels instant
const FAMILY_CACHE_KEY = 'cq_family'

function getCachedFamily() {
  try { return JSON.parse(sessionStorage.getItem(FAMILY_CACHE_KEY)) } catch { return null }
}
function setCachedFamily(data) {
  try { sessionStorage.setItem(FAMILY_CACHE_KEY, JSON.stringify(data)) } catch {}
}
function clearCachedFamily() {
  try { sessionStorage.removeItem(FAMILY_CACHE_KEY) } catch {}
}

export function useAuth() {
  const cached = getCachedFamily()
  const [user,    setUser]    = useState(null)
  const [family,  setFamily]  = useState(cached) // start with cache = instant
  const [loading, setLoading] = useState(true)

  const fetchFamily = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('parent_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      setFamily(data ?? null)
      if (data) setCachedFamily(data)
      else clearCachedFamily()
    } catch (err) {
      console.error('fetchFamily error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // If we have a cache, stop showing spinner immediately
        // then refresh family in background
        if (cached) setLoading(false)
        fetchFamily(session.user.id)
      } else {
        clearCachedFamily()
        setFamily(null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await fetchFamily(session.user.id)
        else { setFamily(null); clearCachedFamily(); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchFamily])

  const signUp = useCallback(async ({ email, password, parentName }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({ parent_id: data.user.id, parent_name: parentName })
      .select()
      .single()
    if (familyError) throw familyError
    await supabase.from('subscriptions').insert({ family_id: familyData.id, plan: 'free', status: 'active' })
    setFamily(familyData)
    setCachedFamily(familyData)
    return { user: data.user, family: familyData }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Eagerly set user so screen can switch immediately
    setUser(data.user)
    // Fetch family in background — cached version already shown if available
    fetchFamily(data.user.id)
    return data
  }, [fetchFamily])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setFamily(null)
    clearCachedFamily()
  }, [])

  return { user, family, loading, signUp, signIn, signOut, fetchFamily }
}
