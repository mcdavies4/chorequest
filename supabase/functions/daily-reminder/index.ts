// supabase/functions/daily-reminder/index.ts
// ─────────────────────────────────────────────────────────────
// Cron Edge Function — runs every day at 5pm UTC.
// Sends a push notification to every kid who still has
// incomplete chores for the day.
//
// Schedule this in Supabase Dashboard:
//   Edge Functions → daily-reminder → Schedule
//   Cron: 0 17 * * *   (5pm UTC every day)
// ─────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase    = createClient(supabaseUrl, supabaseKey)

    // Get all kids who have at least one incomplete, non-pending chore
    const { data: kidsWithChores, error } = await supabase
      .from('kids')
      .select(`
        id,
        name,
        family_id,
        chores!inner(id, done, pending)
      `)
      .eq('chores.done', false)
      .eq('chores.pending', false)

    if (error) throw error
    if (!kidsWithChores || kidsWithChores.length === 0) {
      return new Response(JSON.stringify({ message: 'No kids with incomplete chores' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Deduplicate kids (a kid may appear multiple times due to join)
    const uniqueKids = Array.from(
      new Map(kidsWithChores.map(k => [k.id, k])).values()
    )

    console.log(`Sending daily reminders to ${uniqueKids.length} kids`)

    // For each kid, call the send-push function
    const sendPushUrl = `${supabaseUrl}/functions/v1/send-push`
    const authHeader  = `Bearer ${supabaseKey}`

    const results = await Promise.allSettled(
      uniqueKids.map(async (kid) => {
        const incompleteCount = kidsWithChores
          .filter(k => k.id === kid.id)
          .length

        const messages = [
          `You still have ${incompleteCount} chore${incompleteCount > 1 ? 's' : ''} left today! ⚡`,
          `Don't forget your chores — ${incompleteCount} left to go! 🏆`,
          `Almost there! Finish your ${incompleteCount} remaining chore${incompleteCount > 1 ? 's' : ''} to earn coins 🪙`,
        ]
        const body = messages[Math.floor(Math.random() * messages.length)]

        const res = await fetch(sendPushUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
          body: JSON.stringify({
            family_id: kid.family_id,
            user_type: 'kid',
            kid_id:    kid.id,
            title:     `Hey ${kid.name}! ⏰`,
            body,
            url:       '/',
            tag:       'daily-reminder',
          }),
        })

        if (!res.ok) throw new Error(`send-push returned ${res.status}`)
        return await res.json()
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return new Response(
      JSON.stringify({ sent, failed, totalKids: uniqueKids.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('daily-reminder error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
