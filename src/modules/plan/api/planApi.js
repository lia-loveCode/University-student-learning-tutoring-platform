import { mockRequest } from '../../../shared/api/request.js'
import { initialOnceTasks, initialRecurringTemplates } from '../model/planMock.js'
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

let onceTasks = structuredClone(initialOnceTasks)
let recurringTemplates = structuredClone(initialRecurringTemplates)
/** @type {Record<string, boolean>} */
let checkins = {}
/** @type {Record<string, boolean>} key: `${templateId}::${isoDate}` */
let recurringDayDone = {}

function normalizeCourseLink(payload) {
  const linkUrl = sanitizeLinkUrl(payload.linkUrl)
  if (linkUrl) return { courseId: null, linkUrl }
  const cid =
    payload.courseId && String(payload.courseId).trim() ? String(payload.courseId) : null
  return { courseId: cid, linkUrl: null }
}

function recurringDayKey(templateId, date) {
  return `${templateId}::${date}`
}

export function fetchPlanDashboard() {
  return mockRequest(
    () =>
      /** @type {PlanDashboard} */ ({
        onceTasks: structuredClone(onceTasks),
        recurringTemplates: structuredClone(recurringTemplates),
        checkins: { ...checkins },
        recurringDayDone: { ...recurringDayDone },
      }),
  )
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
export function addOnceTask(payload) {
  return mockRequest(() => {
    const now = new Date().toISOString()
    const { courseId, linkUrl } = normalizeCourseLink(payload)
    const t = {
      id: `t_${Date.now()}`,
      title: payload.title.trim(),
      plannedDate: payload.plannedDate,
      due: payload.due || null,
      slot: payload.slot || '',
      tags: payload.tags?.length ? payload.tags : ['复习'],
      courseId,
      linkUrl,
      notes: payload.notes || '',
      subtasks: [],
      done: false,
      createdAt: now,
    }
    onceTasks = [t, ...onceTasks]
    return structuredClone(t)
  })
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
export function addRecurringTemplate(payload) {
  return mockRequest(() => {
    const now = new Date().toISOString()
    const { courseId, linkUrl } = normalizeCourseLink(payload)
    const r = {
      id: `r_${Date.now()}`,
      title: payload.title.trim(),
      recurringFrom: payload.recurringFrom,
      recurringTo: payload.recurringTo,
      slot: payload.slot || '',
      tags: payload.tags?.length ? payload.tags : ['习惯'],
      courseId,
      linkUrl,
      notes: payload.notes || '',
      subtasks: [],
      createdAt: now,
    }
    recurringTemplates = [r, ...recurringTemplates]
    return structuredClone(r)
  })
}

export function toggleOnceTaskDone(id) {
  return mockRequest(() => {
    onceTasks = onceTasks.map((t) =>
      t.id === id
        ? {
            ...t,
            done: !t.done,
            doneAt: !t.done ? new Date().toISOString().slice(0, 10) : undefined,
          }
        : t,
    )
    const row = onceTasks.find((t) => t.id === id) ?? null
    return row ? structuredClone(row) : null
  })
}

export function toggleRecurringDayDone(templateId, date) {
  return mockRequest(() => {
    const key = recurringDayKey(templateId, date)
    recurringDayDone[key] = !recurringDayDone[key]
    return { templateId, date, done: !!recurringDayDone[key] }
  })
}

export function deleteOnceTask(id) {
  return mockRequest(() => {
    const before = onceTasks.length
    onceTasks = onceTasks.filter((t) => t.id !== id)
    return { deleted: before !== onceTasks.length }
  })
}

export function deleteRecurringTemplate(id) {
  return mockRequest(() => {
    const before = recurringTemplates.length
    recurringTemplates = recurringTemplates.filter((r) => r.id !== id)
    const prefix = `${id}::`
    recurringDayDone = Object.fromEntries(
      Object.entries(recurringDayDone).filter(([k]) => !k.startsWith(prefix)),
    )
    return { deleted: before !== recurringTemplates.length }
  })
}

/**
 * 仅写入当日打卡标记，不修改 onceTasks / recurringDayDone；
 * 连续任务仍须在每一天的列上单独点「完成」。
 */
export function setCheckin(date, value) {
  return mockRequest(() => {
    if (value) checkins[date] = true
    else delete checkins[date]
    return { date, checkedIn: !!checkins[date] }
  })
}

export function updateOnceTaskNotes(id, notes) {
  return mockRequest(() => {
    onceTasks = onceTasks.map((t) => (t.id === id ? { ...t, notes } : t))
    const row = onceTasks.find((t) => t.id === id) ?? null
    return row ? structuredClone(row) : null
  })
}

export function updateRecurringNotes(id, notes) {
  return mockRequest(() => {
    recurringTemplates = recurringTemplates.map((r) =>
      r.id === id ? { ...r, notes } : r,
    )
    const row = recurringTemplates.find((r) => r.id === id) ?? null
    return row ? structuredClone(row) : null
  })
}

export function isRecurringDayDone(templateId, date, snapshot = recurringDayDone) {
  return !!snapshot[recurringDayKey(templateId, date)]
}
