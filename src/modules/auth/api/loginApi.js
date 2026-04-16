import { getSupabase, isSupabaseConfigured } from '../../../shared/lib/supabaseClient.js'

/**
 * 使用 Supabase Auth 邮箱密码登录。
 * @returns {{ ok: true, user: { id: string, email?: string } } | { ok: false, code: string, message: string }}
 */
export async function signInWithEmail({ email, password }) {
  if (!isSupabaseConfigured() || !getSupabase()) {
    return {
      ok: false,
      code: 'not_configured',
      message: '未配置 Supabase：请在项目根目录创建 .env 并填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。',
    }
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    return { ok: false, code: mapErrorCode(error), message: mapErrorMessage(error) }
  }

  const user = data.user
  if (!user) {
    return { ok: false, code: 'unknown', message: '登录失败，请稍后重试。' }
  }

  await syncSupabaseSessionToServer(supabase)

  return {
    ok: true,
    user: { id: user.id, email: user.email ?? undefined },
  }
}

/**
 * 将当前 Supabase 会话写入开发/预览服务器的 httpOnly Cookie（/api/auth/session）。
 * 纯静态部署时请求可能失败，此时忽略即可。
 */
export async function syncSupabaseSessionToServer(supabase) {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) return { ok: false }

  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }),
    })
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('application/json')) return { ok: false }
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.ok) return { ok: false }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

/**
 * 读取服务端会话（依赖 /api/auth/me）。
 * @returns {{ ok: true, user: { id: string, email?: string } } | { ok: false, code: string }}
 */
export async function fetchServerSessionUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('application/json')) {
      return { ok: false, code: 'no_server_api' }
    }
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.ok || !json.user) {
      return { ok: false, code: json?.code ?? 'unauthorized' }
    }
    return { ok: true, user: json.user }
  } catch {
    return { ok: false, code: 'network' }
  }
}

/** 清除服务端 Cookie 并退出 Supabase（若已配置）。 */
export async function signOutEverywhere() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  } catch {
    /* ignore */
  }
  const supabase = getSupabase()
  if (supabase) await supabase.auth.signOut()
}

function mapErrorCode(error) {
  const raw = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()
  if (raw.includes('invalid') && (raw.includes('credential') || raw.includes('password'))) {
    return 'invalid_credentials'
  }
  if (
    raw.includes('email_not_confirmed') ||
    raw.includes('email not confirmed') ||
    (raw.includes('confirm') && raw.includes('email'))
  ) {
    return 'email_not_confirmed'
  }
  if (raw.includes('too many requests') || raw.includes('rate')) {
    return 'rate_limited'
  }
  if (raw.includes('network') || raw.includes('fetch')) {
    return 'network'
  }
  return 'unknown'
}

function mapErrorMessage(error) {
  const code = mapErrorCode(error)
  const fallbacks = {
    invalid_credentials: '邮箱或密码不正确，请检查后重试。',
    email_not_confirmed: '邮箱尚未验证，请先查收邮件完成验证后再登录。',
    rate_limited: '操作过于频繁，请稍后再试。',
    network: '网络异常或无法连接服务器，请检查网络后重试。',
    not_configured: '未配置 Supabase环境变量。',
    unknown: error.message?.trim() || '登录失败，请稍后重试。',
  }
  return fallbacks[code] ?? fallbacks.unknown
}
