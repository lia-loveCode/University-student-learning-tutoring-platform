import { getSupabase } from '../../../shared/lib/supabaseClient.js'
import { ApiError } from '../../../shared/api/request.js'

/** @param {import('@supabase/supabase-js').SupabaseClient} sb */
function mapAnswerRow(a) {
  return {
    id: a.id,
    author: a.author,
    content: a.content,
    createdAt: a.created_at,
  }
}

/** @param {Record<string, unknown>} row @param {Map<string, Record<string, unknown>[]>} byQ */
function mapQuestionRow(row, byQ) {
  const id = String(row.id)
  const raw = byQ.get(id) ?? []
  return {
    id,
    title: row.title,
    category: row.category,
    author: row.author,
    views: row.views ?? 0,
    createdAt: row.created_at,
    tags: Array.isArray(row.tags) ? row.tags : [],
    content: row.content ?? '',
    answers: raw.map(mapAnswerRow),
  }
}

export async function listQuestions() {
  const sb = getSupabase()
  if (!sb) return []
  const { data: qs, error: e1 } = await sb.from('qa_questions').select('*').order('id', { ascending: false })
  if (e1) throw e1
  if (!qs?.length) return []
  const ids = qs.map((q) => String(q.id))
  const { data: ans, error: e2 } = await sb.from('qa_answers').select('*').in('question_id', ids)
  if (e2) throw e2
  /** @type {Map<string, Record<string, unknown>[]>} */
  const byQ = new Map()
  for (const a of ans ?? []) {
    const qid = String(a.question_id)
    const list = byQ.get(qid) ?? []
    list.push(a)
    byQ.set(qid, list)
  }
  return qs.map((q) => mapQuestionRow(q, byQ))
}

export async function createQuestion({ title, category, content, tags }) {
  const sb = getSupabase()
  if (!sb) {
    throw new ApiError('未配置 Supabase：请在 .env 填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY', {
      code: 'NO_SUPABASE',
    })
  }
  const id = `q_${Date.now()}`
  const row = {
    id,
    title: title.trim(),
    category: category || '其他',
    author: '访客',
    content: (content ?? '').trim(),
    tags: Array.isArray(tags) && tags.length ? tags : [],
  }
  const { data, error } = await sb.from('qa_questions').insert(row).select('*').single()
  if (error) throw error
  return mapQuestionRow(data, new Map([[id, []]]))
}
