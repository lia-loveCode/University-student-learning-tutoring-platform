import { getSupabase } from '../../../shared/lib/supabaseClient.js'
import { ApiError } from '../../../shared/api/request.js'
import { sanitizeLinkUrl } from '../utils/planAssociation.js'

/**
 * @typedef {{ id: string, label: string, done: boolean }} PlanSubtask
 */

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   plannedDate: string,
 *   due: string | null,
 *   slot: string,
 *   tags: string[],
 *   courseId: string | null,
 *   linkUrl: string | null,
 *   notes: string,
 *   subtasks: PlanSubtask[],
 *   done: boolean,
 *   doneAt?: string,
 *   createdAt: string,
 * }} OnceTask
 */

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   recurringFrom: string,
 *   recurringTo: string,
 *   slot: string,
 *   tags: string[],
 *   courseId: string | null,
 *   linkUrl: string | null,
 *   notes: string,
 *   subtasks: PlanSubtask[],
 *   createdAt: string,
 * }} RecurringTemplate
 */

/**
 * @typedef {{
 *   onceTasks: OnceTask[],
 *   recurringTemplates: RecurringTemplate[],
 *   checkins: Record<string, boolean>,
 *   recurringDayDone: Record<string, boolean>,
 * }} PlanDashboard
 */

function requireSb() {
  const sb = getSupabase()
  if (!sb) {
    throw new ApiError('未配置 Supabase：请在 .env 填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY', {
      code: 'NO_SUPABASE',
    })
  }
  return sb
}

function asTags(v) {
  if (Array.isArray(v)) return v
  if (v == null) return []
  return []
}

function asSubtasks(v) {
  if (Array.isArray(v)) return v
  if (v == null) return []
  return []
}

/** @param {import('@supabase/supabase-js').SupabaseClient} sb */
function mapOnceRow(row) {
  return {
    id: row.id,
    title: row.title,
    plannedDate: row.planned_date,
    due: row.due ?? null,
    slot: row.slot ?? '',
    tags: asTags(row.tags),
    courseId: row.course_id ?? null,
    linkUrl: row.link_url ?? null,
    notes: row.notes ?? '',
    subtasks: asSubtasks(row.subtasks),
    done: !!row.done,
    doneAt: row.done_at ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

function mapRecurringRow(row) {
  return {
    id: row.id,
    title: row.title,
    recurringFrom: row.recurring_from,
    recurringTo: row.recurring_to,
    slot: row.slot ?? '',
    tags: asTags(row.tags),
    courseId: row.course_id ?? null,
    linkUrl: row.link_url ?? null,
    notes: row.notes ?? '',
    subtasks: asSubtasks(row.subtasks),
    createdAt: new Date(row.created_at).toISOString(),
  }
}

function recurringDayKey(templateId, date) {
  return `${templateId}::${date}`
}

export async function fetchPlanDashboard() {
  const sb = getSupabase()
  if (!sb) {
    return /** @type {PlanDashboard} */ ({
      onceTasks: [],
      recurringTemplates: [],
      checkins: {},
      recurringDayDone: {},
    })
  }

  const [onceRes, recRes, checkRes, dayRes] = await Promise.all([
    sb.from('plan_once_tasks').select('*').order('created_at', { ascending: false }),
    sb.from('plan_recurring_templates').select('*').order('created_at', { ascending: false }),
    sb.from('plan_checkins').select('*'),
    sb.from('plan_recurring_day_done').select('*').eq('done', true),
  ])

  for (const r of [onceRes, recRes, checkRes, dayRes]) {
    if (r.error) throw r.error
  }

  /** @type {Record<string, boolean>} */
  const checkins = {}
  for (const row of checkRes.data ?? []) {
    if (row.checked) checkins[row.day] = true
  }

  /** @type {Record<string, boolean>} */
  const recurringDayDone = {}
  for (const row of dayRes.data ?? []) {
    recurringDayDone[recurringDayKey(row.template_id, row.day_date)] = true
  }

  return {
    onceTasks: (onceRes.data ?? []).map(mapOnceRow),
    recurringTemplates: (recRes.data ?? []).map(mapRecurringRow),
    checkins,
    recurringDayDone,
  }
}

function normalizeCourseLink(payload) {
  const linkUrl = sanitizeLinkUrl(payload.linkUrl)
  if (linkUrl) return { courseId: null, linkUrl }
  const cid =
    payload.courseId && String(payload.courseId).trim() ? String(payload.courseId) : null
  return { courseId: cid, linkUrl: null }
}

/**
 * @param {{
 *   title: string,
 *   plannedDate: string,
 *   due: string | null,
 *   slot: string,
 *   tags: string[],
 *   courseId: string | null,
 *   linkUrl?: string | null,
 *   notes: string,
 * }} payload
 */
export async function addOnceTask(payload) {
  const sb = requireSb()
  const now = new Date().toISOString()
  const { courseId, linkUrl } = normalizeCourseLink(payload)
  const id = `t_${Date.now()}`
  const row = {
    id,
    title: payload.title.trim(),
    planned_date: payload.plannedDate,
    due: payload.due || null,
    slot: payload.slot || '',
    tags: payload.tags?.length ? payload.tags : ['复习'],
    course_id: courseId,
    link_url: linkUrl,
    notes: payload.notes || '',
    subtasks: [],
    done: false,
    created_at: now,
  }
  const { data, error } = await sb.from('plan_once_tasks').insert(row).select('*').single()
  if (error) throw error
  return mapOnceRow(data)
}

/**
 * @param {{
 *   title: string,
 *   recurringFrom: string,
 *   recurringTo: string,
 *   slot: string,
 *   tags: string[],
 *   courseId: string | null,
 *   linkUrl?: string | null,
 *   notes: string,
 * }} payload
 */
export async function addRecurringTemplate(payload) {
  const sb = requireSb()
  const now = new Date().toISOString()
  const { courseId, linkUrl } = normalizeCourseLink(payload)
  const id = `r_${Date.now()}`
  const row = {
    id,
    title: payload.title.trim(),
    recurring_from: payload.recurringFrom,
    recurring_to: payload.recurringTo,
    slot: payload.slot || '',
    tags: payload.tags?.length ? payload.tags : ['习惯'],
    course_id: courseId,
    link_url: linkUrl,
    notes: payload.notes || '',
    subtasks: [],
    created_at: now,
  }
  const { data, error } = await sb.from('plan_recurring_templates').insert(row).select('*').single()
  if (error) throw error
  return mapRecurringRow(data)
}

export async function toggleOnceTaskDone(id) {
  const sb = requireSb()
  const { data: cur, error: e1 } = await sb.from('plan_once_tasks').select('done').eq('id', id).maybeSingle()
  if (e1) throw e1
  if (!cur) return null
  const nextDone = !cur.done
  const doneAt = nextDone ? new Date().toISOString().slice(0, 10) : null
  const { data, error } = await sb
    .from('plan_once_tasks')
    .update({ done: nextDone, done_at: doneAt })
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data ? mapOnceRow(data) : null
}

export async function toggleRecurringDayDone(templateId, date) {
  const sb = requireSb()
  const { data: existing } = await sb
    .from('plan_recurring_day_done')
    .select('done')
    .eq('template_id', templateId)
    .eq('day_date', date)
    .maybeSingle()

  const next = !(existing?.done ?? false)

  if (next) {
    const { error } = await sb
      .from('plan_recurring_day_done')
      .upsert(
        { template_id: templateId, day_date: date, done: true },
        { onConflict: 'template_id,day_date' },
      )
    if (error) throw error
  } else {
    const { error } = await sb.from('plan_recurring_day_done').delete().eq('template_id', templateId).eq('day_date', date)
    if (error) throw error
  }

  return { templateId, date, done: next }
}

export async function deleteOnceTask(id) {
  const sb = requireSb()
  const { data: row } = await sb.from('plan_once_tasks').select('id').eq('id', id).maybeSingle()
  if (!row) return { deleted: false }
  const { error } = await sb.from('plan_once_tasks').delete().eq('id', id)
  if (error) throw error
  return { deleted: true }
}

export async function deleteRecurringTemplate(id) {
  const sb = requireSb()
  const { data: row } = await sb.from('plan_recurring_templates').select('id').eq('id', id).maybeSingle()
  if (!row) return { deleted: false }
  const { error } = await sb.from('plan_recurring_templates').delete().eq('id', id)
  if (error) throw error
  return { deleted: true }
}

export async function setCheckin(date, value) {
  const sb = requireSb()
  if (value) {
    const { error } = await sb.from('plan_checkins').upsert({ day: date, checked: true }, { onConflict: 'day' })
    if (error) throw error
  } else {
    const { error } = await sb.from('plan_checkins').delete().eq('day', date)
    if (error) throw error
  }
  return { date, checkedIn: value }
}

export async function updateOnceTaskNotes(id, notes) {
  const sb = requireSb()
  const { data, error } = await sb.from('plan_once_tasks').update({ notes }).eq('id', id).select('*').maybeSingle()
  if (error) throw error
  return data ? mapOnceRow(data) : null
}

export async function updateRecurringNotes(id, notes) {
  const sb = requireSb()
  const { data, error } = await sb
    .from('plan_recurring_templates')
    .update({ notes })
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data ? mapRecurringRow(data) : null
}

export function isRecurringDayDone(templateId, date, snapshot = {}) {
  return !!snapshot[recurringDayKey(templateId, date)]
}
