// supabase/functions/send-push/index.ts
// ─────────────────────────────────────────────────────────────
// Core Edge Function that sends a Web Push notification to all
// matching subscribers in the push_subscriptions table.
//
// Called by:
//   - useFamily.js (markChorePending, approveChore) via direct invoke
//   - daily-reminder function (cron)
//   - weekly-summary function (cron)
//
// POST body:
// {
//   family_id: string
//   user_type: 'parent' | 'kid' | 'all'
//   kid_id?: string       (filter to specific kid)
//   title: string
//   body: string
//   url?: string          (where to open on click)
//   tag?: string          (deduplication key)
// }
// ─────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Web Push signing using VAPID
// Deno-compatible implementation
async function sendWebPush(subscription: {
  endpoint: string
  p256dh: string
  auth: string
}, payload: string, vapidPrivateKey: string, vapidPublicKey: string, vapidSubject: string) {
  // Build the payload
  const payloadBytes = new TextEncoder().encode(payload)

  // For simplicity we use the web-push compatible approach via fetch
  // In production you'd use a proper VAPID signing library
  // This implementation uses the vapid-jwt approach
  const headers: Record<string, string> = {
    'Content-Type':     'application/octet-stream',
    'Content-Encoding': 'aes128gcm',
    'TTL':              '86400',
  }

  // Build minimal VAPID auth header
  // Using the pre-built approach — Deno doesn't have native web-push
  // so we call the Supabase DB to get subscription and use fetch directly
  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers,
    body: payloadBytes,
  })

  return res.status
}

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!
    const supabaseKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublic  = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@chorequest.app'

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { family_id, user_type, kid_id, title, body, url, tag } = await req.json()

    if (!family_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: family_id, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch matching subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('family_id', family_id)

    if (user_type && user_type !== 'all') query = query.eq('user_type', user_type)
    if (kid_id) query = query.eq('kid_id', kid_id)

    const { data: subscriptions, error: fetchErr } = await query
    if (fetchErr) throw fetchErr
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No subscriptions found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Notification payload
    const notification = JSON.stringify({ title, body, url: url || '/', tag: tag || 'chorequest', icon: '/icon-192.png' })

    // Send to each subscriber using web-push via a helper module
    const webpush = await import('https://esm.sh/web-push@3.6.6')
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }
        await webpush.sendNotification(pushSubscription, notification)
        return sub.id
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    // Clean up expired subscriptions (410 Gone)
    const expiredEndpoints: string[] = []
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const err = result.reason as any
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          expiredEndpoints.push(subscriptions[i].endpoint)
        }
      }
    })

    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
      console.log(`Removed ${expiredEndpoints.length} expired subscriptions`)
    }

    return new Response(
      JSON.stringify({ sent, failed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('send-push error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
