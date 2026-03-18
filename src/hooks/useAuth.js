import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function getCachedFamily() {
  try { return JSON.parse(sessionStorage.getItem('cq_family')) } catch { return null }
}
function setCachedFamily(data) {
  try { sessionStorage.setItem('cq_family', JSON.stringify(data)) } catch {}
}
function clearCachedFamily() {
  try { sessionStorage.removeItem('cq_family') } catch {}
}

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [family,  setFamily]  = useState(getCachedFamily)
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
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        // If cached family exists, stop spinner immediately
        if (getCachedFamily()) setLoading(false)
        fetchFamily(u.id)
      } else {
        clearCachedFamily()
        setFamily(null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          fetchFamily(u.id)
        } else {
          setFamily(null)
          clearCachedFamily()
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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
    await supabase.from('subscriptions')
      .insert({ family_id: familyData.id, plan: 'free', status: 'active' })
    setFamily(familyData)
    setCachedFamily(familyData)
    return { user: data.user, family: familyData }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(data.user)
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
