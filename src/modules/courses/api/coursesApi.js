import { getSupabase } from '../../../shared/lib/supabaseClient.js'

export async function listCourses() {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('courses').select('*').order('title')
  if (error) throw error
  return data ?? []
}

export async function getCourseById(id) {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.from('courses').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}
