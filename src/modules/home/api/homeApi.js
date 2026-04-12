import { getSupabase } from '../../../shared/lib/supabaseClient.js'

/** @returns {Promise<{ id: string, title: string, desc: string, kicker: string, cta: { label: string, to: string }, secondaryCta: { label: string, to: string }, tone: string, image: string | null }[]>} */
export async function getHomeBannerSlides() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('home_banner_slides').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    desc: r.slide_desc,
    kicker: r.kicker,
    cta: { label: r.cta_label, to: r.cta_to },
    secondaryCta: { label: r.secondary_cta_label, to: r.secondary_cta_to },
    tone: r.tone,
    image: r.image_url ?? null,
  }))
}

/** @returns {Promise<{ id: string, title: string, desc: string, to: string, icon: string }[]>} */
export async function getHomeQuickActions() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('home_quick_actions').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    desc: r.action_desc,
    to: r.route,
    icon: r.icon,
  }))
}

export async function getHomeStats() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('home_site_stats').select('*').order('stat_key')
  if (error) throw error
  return (data ?? []).map((r) => ({
    key: r.stat_key,
    label: r.label,
    value: Number(r.value),
    trend: Number(r.trend),
  }))
}

export async function getHomeMentors() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('home_mentors').select('*').order('name')
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    major: r.major ?? '',
    tags: Array.isArray(r.tags) ? r.tags : [],
    sessions: r.sessions ?? 0,
    rating: Number(r.rating),
  }))
}

export async function getHomeCourses() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from('courses')
    .select('id, title, category, author, learners, rating')
    .order('learners', { ascending: false })
    .limit(8)
  if (error) throw error
  return data ?? []
}

export async function getHomeHotQuestions() {
  const sb = getSupabase()
  if (!sb) return []
  const { data: qs, error } = await sb
    .from('qa_questions')
    .select('id, title, category, views')
    .order('views', { ascending: false })
    .limit(4)
  if (error) throw error
  if (!qs?.length) return []
  const ids = qs.map((q) => q.id)
  const { data: ansRows, error: e2 } = await sb.from('qa_answers').select('question_id').in('question_id', ids)
  if (e2) throw e2
  const counts = new Map()
  for (const a of ansRows ?? []) {
    counts.set(a.question_id, (counts.get(a.question_id) ?? 0) + 1)
  }
  return qs.map((q) => ({
    id: q.id,
    title: q.title,
    tag: q.category,
    answers: counts.get(q.id) ?? 0,
    views: q.views ?? 0,
  }))
}
