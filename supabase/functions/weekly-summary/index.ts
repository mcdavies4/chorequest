// supabase/functions/weekly-summary/index.ts
// ─────────────────────────────────────────────────────────────
// Cron Edge Function — runs every Sunday at 8am UTC.
// Sends each parent a weekly summary push notification
// showing how many chores their kids completed and total earned.
//
// Schedule in Supabase Dashboard:
//   Edge Functions → weekly-summary → Schedule
//   Cron: 0 8 * * 0   (8am UTC every Sunday)
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

    // Get all families with their kids
    const { data: families, error: familiesErr } = await supabase
      .from('families')
      .select(`id, parent_name, kids(id, name, avatar, balance, chores(done))`)

    if (familiesErr) throw familiesErr
    if (!families || families.length === 0) {
      return new Response(JSON.stringify({ message: 'No families found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const sendPushUrl = `${supabaseUrl}/functions/v1/send-push`
    const authHeader  = `Bearer ${supabaseKey}`

    const results = await Promise.allSettled(
      families.map(async (family) => {
        if (!family.kids || family.kids.length === 0) return

        // Build summary string
        const kidSummaries = family.kids.map((kid: any) => {
          const done  = (kid.chores || []).filter((c: any) => c.done).length
          const total = (kid.chores || []).length
          return `${kid.avatar} ${kid.name}: ${done}/${total} chores`
        })

        const totalDone  = family.kids.reduce((sum: number, k: any) => sum + (k.chores || []).filter((c: any) => c.done).length, 0)
        const totalChores = family.kids.reduce((sum: number, k: any) => sum + (k.chores || []).length, 0)
        const pct = totalChores > 0 ? Math.round((totalDone / totalChores) * 100) : 0

        const emoji = pct === 100 ? '🌟' : pct >= 75 ? '🔥' : pct >= 50 ? '👍' : '💪'

        const body = `${kidSummaries.join(' · ')} — ${pct}% completion ${emoji}`

        const res = await fetch(sendPushUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
          body: JSON.stringify({
            family_id: family.id,
            user_type: 'parent',
            title:     `Weekly Report for the ${family.parent_name} family 📋`,
            body,
            url:       '/',
            tag:       'weekly-summary',
          }),
        })

        if (!res.ok) throw new Error(`send-push returned ${res.status}`)
        return await res.json()
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return new Response(
      JSON.stringify({ sent, failed, totalFamilies: families.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('weekly-summary error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
