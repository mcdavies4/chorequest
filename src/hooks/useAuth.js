import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [family,  setFamily]  = useState(null)
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
    } catch (err) {
      console.error('fetchFamily error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchFamily(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await fetchFamily(session.user.id)
        else { setFamily(null); setLoading(false) }
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

    await supabase
      .from('subscriptions')
      .insert({ family_id: familyData.id, plan: 'free', status: 'active' })

    setFamily(familyData)
    return { user: data.user, family: familyData }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setFamily(null)
  }, [])

  return { user, family, loading, signUp, signIn, signOut, fetchFamily }
}
