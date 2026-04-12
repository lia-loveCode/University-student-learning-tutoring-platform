import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client

/**
 * Returns a Supabase client when env is set; otherwise null (callers fall back to mock).
 */
export function getSupabase() {
  if (!url || !anonKey) return null
  if (!client) client = createClient(url, anonKey)
  return client
}

export function isSupabaseConfigured() {
  return Boolean(url && anonKey)
}
