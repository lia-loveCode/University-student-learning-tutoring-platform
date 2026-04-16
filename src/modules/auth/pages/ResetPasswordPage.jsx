import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '../../../shared/lib/supabaseClient.js'
import styles from './ResetPasswordPage.module.css'

function parseHashParams(hash) {
  const out = new URLSearchParams()
  const raw = String(hash || '')
  const s = raw.startsWith('#') ? raw.slice(1) : raw
  for (const [k, v] of new URLSearchParams(s).entries()) out.set(k, v)
  return out
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [banner, setBanner] = useState(null) // { kind: 'ok'|'bad', text: string }
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const tokens = useMemo(() => {
    const url = new URL(window.location.href)
    const q = url.searchParams
    const h = parseHashParams(url.hash)
    return {
      code: q.get('code'),
      type: h.get('type') || q.get('type'),
      access_token: h.get('access_token'),
      refresh_token: h.get('refresh_token'),
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function prepare() {
      if (!isSupabaseConfigured() || !getSupabase()) {
        setBanner({ kind: 'bad', text: '未配置 Supabase，无法重置密码。' })
        setReady(true)
        return
      }

      const supabase = getSupabase()

      try {
        // PKCE flow: email link may contain ?code=...
        if (tokens.code && supabase.auth.exchangeCodeForSession) {
          const { error } = await supabase.auth.exchangeCodeForSession(tokens.code)
          if (error) throw error
        } else if (tokens.access_token && tokens.refresh_token) {
          // Implicit flow: email link may contain #access_token=...&refresh_token=...
          const { error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          })
          if (error) throw error
        }

        const { data } = await supabase.auth.getSession()
        if (!data?.session) {
          setBanner({
            kind: 'bad',
            text:
              '未检测到可用的重置会话。请重新打开最新的重置邮件链接（旧链接可能已过期）。',
          })
          setReady(true)
          return
        }

        // 清掉 hash（避免 token 长期留在地址栏/历史记录里）
        if (!cancelled) {
          window.history.replaceState({}, document.title, `${location.pathname}${location.search}`)
        }

        setBanner({ kind: 'ok', text: '验证成功，请设置新密码。' })
        setReady(true)
      } catch (e) {
        const msg = e?.message ? String(e.message) : '验证失败，请重新打开最新的重置邮件链接。'
        setBanner({ kind: 'bad', text: msg })
        setReady(true)
      }
    }

    // 只在 recovery 流程时展示；如果用户误入，仍可继续但会提示
    if (tokens.type && tokens.type !== 'recovery') {
      setBanner({ kind: 'bad', text: '当前链接不是重置密码链接，请重新从邮件打开。' })
      setReady(true)
      return () => {
        cancelled = true
      }
    }

    prepare()

    return () => {
      cancelled = true
    }
  }, [location.pathname, location.search, tokens.access_token, tokens.code, tokens.refresh_token, tokens.type])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password || password.length < 8) {
      setBanner({ kind: 'bad', text: '新密码至少 8 位。' })
      return
    }
    if (password !== password2) {
      setBanner({ kind: 'bad', text: '两次输入的密码不一致。' })
      return
    }
    if (!getSupabase()) return

    setBusy(true)
    try {
      const { error } = await getSupabase().auth.updateUser({ password })
      if (error) throw error
      setBanner({ kind: 'ok', text: '密码已更新，请使用新密码登录。' })
      setPassword('')
      setPassword2('')
      setTimeout(() => navigate('/login', { replace: true }), 700)
    } catch (e2) {
      const msg = e2?.message ? String(e2.message) : '更新失败，请稍后重试。'
      setBanner({ kind: 'bad', text: msg })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>重置密码</h1>
      <p className={styles.sub}>请在验证通过后设置一个新密码。</p>

      <div className={styles.card}>
        {banner ? (
          <div className={`${styles.banner} ${banner.kind === 'bad' ? styles.bannerBad : ''}`}>
            {banner.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="rp1">
              新密码
            </label>
            <input
              id="rp1"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位"
              disabled={!ready || busy}
            />
            <p className={styles.hint}>建议包含字母与数字，避免过于简单。</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="rp2">
              再次输入新密码
            </label>
            <input
              id="rp2"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="重复输入"
              disabled={!ready || busy}
            />
          </div>

          <div className={styles.actions}>
            <button className={styles.btn} type="submit" disabled={!ready || busy}>
              {busy ? '提交中…' : '更新密码'}
            </button>
            <Link className={`${styles.btn} ${styles.btnGhost}`} to="/login">
              返回登录
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

