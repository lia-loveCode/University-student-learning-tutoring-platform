import { getSupabase, isSupabaseConfigured } from '../../../shared/lib/supabaseClient.js'

/**
 * 使用 Supabase 身份服务（Supabase Auth）注册。
 * @returns {{ ok: true, needsEmailConfirm: boolean } | { ok: false, code: string, message: string }}
 */
export async function signUpWithEmail({ email, password }) {
  if (!isSupabaseConfigured() || !getSupabase()) {
    return {
      ok: false,
      code: 'not_configured',
      message: '未配置 Supabase：请在项目根目录创建 .env 并填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。',
    }
  }

  const supabase = getSupabase()
  const emailRedirectTo =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/auth/callback`
      : undefined

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  })

  if (error) {
    return { ok: false, code: mapErrorCode(error), message: mapErrorMessage(error) }
  }

  // Supabase 在开启 “email confirmations / anti user enumeration” 时，
  // 对已存在的邮箱可能返回 error=null，但 identities 为空（表示未创建新 identity）。
  // 这种情况下不能当作“注册成功”，否则会导致后续登录必然失败（密码未被设置/更新）。
  const identities = data?.user?.identities
  if (Array.isArray(identities) && identities.length === 0) {
    return {
      ok: false,
      code: 'user_already_exists',
      message: '该邮箱已注册，请直接登录或尝试找回密码。',
    }
  }

  const needsEmailConfirm = !data.session
  return { ok: true, needsEmailConfirm }
}

function mapErrorCode(error) {
  const raw = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()
  if (raw.includes('user_already_registered') || raw.includes('already registered')) {
    return 'user_already_exists'
  }
  if (raw.includes('signup_disabled') || raw.includes('signups not allowed')) {
    return 'signup_disabled'
  }
  if (raw.includes('weak_password') || raw.includes('password')) {
    return 'weak_password'
  }
  if (raw.includes('invalid') && raw.includes('email')) {
    return 'invalid_email'
  }
  if (raw.includes('email') && raw.includes('rate')) {
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
    user_already_exists: '该邮箱已注册，请直接登录或尝试找回密码。',
    signup_disabled: '当前项目已关闭自助注册，请联系管理员。',
    weak_password: '密码不符合服务端要求（例如过短），请调整后再试。',
    invalid_email: '邮箱格式不正确，请检查后重试。',
    rate_limited: '操作过于频繁，请稍后再试。',
    network: '网络异常或无法连接服务器，请检查网络后重试。',
    not_configured: '未配置 Supabase环境变量。',
    unknown: error.message?.trim() || '注册失败，请稍后重试。',
  }
  return fallbacks[code] ?? fallbacks.unknown
}
