import { getSupabase } from '../../../shared/lib/supabaseClient.js'

const EMPTY_SUMMARY = {
  weekFocusHours: 0,
  weekTasksDone: 0,
  weekTasksTotal: 0,
  streakDays: 0,
}

function mapSummaryRow(row) {
  return {
    weekFocusHours: Number(row.week_focus_hours),
    weekTasksDone: row.week_tasks_done,
    weekTasksTotal: row.week_tasks_total,
    streakDays: row.streak_days,
  }
}

export async function getProgressSummary() {
  const sb = getSupabase()
  if (!sb) return EMPTY_SUMMARY
  const { data, error } = await sb.from('progress_summary').select('*').eq('id', 'global').maybeSingle()
  if (error) throw error
  if (!data) return EMPTY_SUMMARY
  return mapSummaryRow(data)
}

export async function getProgressByCategory() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('progress_by_category').select('category, percent').order('category')
  if (error) throw error
  return (data ?? []).map((r) => ({ category: r.category, percent: r.percent }))
}
