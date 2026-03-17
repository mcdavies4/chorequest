import { supabase } from './supabase'

export async function saveOnboarding({ familyId, kids, selectedChores, goals }) {
  const createdKids = []

  for (const kid of kids) {
    const { data: kidRow, error: kidErr } = await supabase
      .from('kids')
      .insert({
        family_id:   familyId,
        name:        kid.name,
        age:         parseInt(kid.age),
        avatar:      kid.avatar,
        pin:         kid.pw,
        goal_name:   goals[kid.id]?.name   || 'My Goal',
        goal_target: parseFloat(goals[kid.id]?.target || 10),
        goal_saved:  0,
        balance:     0,
        streak:      0,
      })
      .select()
      .single()

    if (kidErr) throw kidErr

    const chores = selectedChores[kid.id] || []
    if (chores.length > 0) {
      const { error: choreErr } = await supabase.from('chores').insert(
        chores.map(c => ({
          kid_id:    kidRow.id,
          family_id: familyId,
          title:     c.title,
          icon:      c.icon,
          coins:     c.coins,
          done:      false,
          pending:   false,
        }))
      )
      if (choreErr) throw choreErr
    }

    const weekLabels = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago']
    const { error: histErr } = await supabase.from('weekly_history').insert(
      weekLabels.map(label => ({
        kid_id:           kidRow.id,
        family_id:        familyId,
        week_label:       label,
        earned:           0,
        chores_completed: 0,
        total_chores:     chores.length,
        redeemed:         0,
        top_chore:        '—',
      }))
    )
    if (histErr) throw histErr

    await supabase.from('notifications').insert({
      family_id: familyId,
      kid_id:    kidRow.id,
      type:      'streak',
      message:   `👋 ${kidRow.name} has joined ChoreQuest! First chores assigned.`,
      read:      false,
    })

    createdKids.push({ ...kidRow, chores })
  }

  return createdKids
}
