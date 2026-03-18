// src/lib/stripe.js
import { supabase } from './supabase'

async function invokeFunction(name, body) {
  // Get current session token
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`,
    {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey':        import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Edge Function error ${response.status}: ${text}`)
  }

  return response.json()
}

export async function startCheckout({ familyId, email }) {
  const data = await invokeFunction('create-checkout', {
    family_id:   familyId,
    email,
    success_url: `${window.location.origin}/?checkout=success`,
    cancel_url:  `${window.location.origin}/?checkout=cancel`,
  })
  if (!data?.url) throw new Error('No checkout URL returned')
  window.location.href = data.url
}

export async function openBillingPortal({ familyId }) {
  const data = await invokeFunction('create-portal', {
    family_id:  familyId,
    return_url: `${window.location.origin}/`,
  })
  if (!data?.url) throw new Error('No portal URL returned')
  window.location.href = data.url
}
